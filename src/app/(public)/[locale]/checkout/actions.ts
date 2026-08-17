"use server";

/* Places an order: validates the payload, recomputes every line total and the
   promo discount on the server (the client's numbers are display only), and
   stores the order in the private `orders` table. Guest checkout — no login
   required. Tour AND package prices are re-derived server-side, so the amount
   charged never comes from the browser. */

import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPromo } from "@/lib/content/promo-actions";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { createPayPalOrder, paypalConfigured } from "@/lib/paypal";
import { createMercadoPagoPreference, mercadoPagoConfigured } from "@/lib/mercadopago";
import { notifyNewOrder } from "@/lib/orderEmails";
import { getSessionUser } from "@/lib/supabase/serverAuth";
import { getTourLineTotal } from "@/lib/content/tours";
import { getActivityLineTotal, getPackageLineTotal } from "@/lib/content/packages";
import { getPublicContent } from "@/lib/content/site";
import { createTutcasaHold, createTutcasaRequest, releaseTutcasaHold } from "@/lib/tutcasa";
import { notifyStayRequests, releaseTutcasaStays } from "@/lib/tutcasaBooking";
import type { CartItem } from "@/lib/cart";

export type PlaceOrderInput = {
  items: CartItem[];
  promoCode?: string;
  paymentMethodId: string; // "stripe" | "paypal" | "mercadopago"
  paymentMethod: string; // display name
  name: string;
  email: string;
  whatsapp?: string;
  notes?: string;
  consent: boolean;
};

export type PlaceOrderResult =
  | {
      ok: true;
      id: string;
      subtotal: number;
      discount: number;
      discountLabel?: string;
      total: number;
      /** Present for Stripe orders: redirect the customer here to pay. */
      checkoutUrl?: string;
    }
  | { ok: false; error: string };

const newOrderId = () => `AMN-${Math.floor(100000 + Math.random() * 900000)}`;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    // Basic validation.
    if (!input.items?.length) return { ok: false, error: "Your cart is empty." };
    if (!input.name?.trim() || !/.+@.+\..+/.test(input.email ?? ""))
      return { ok: false, error: "Please provide your name and a valid email." };
    if (!input.consent)
      return { ok: false, error: "Please accept the terms to place your booking." };

    // TutCasa partner stays: lock the dates on TutCasa BEFORE any money moves.
    // The hold both prevents cross-bookings (TutCasa's calendar is the single
    // source of truth) and returns the authoritative USD total we charge —
    // converted to MXN at the admin-configured rate. If a home was grabbed in
    // the meantime, the guest finds out HERE, before paying.
    const stayInputs = input.items.filter((it) => it.kind === "stay");
    // Amanah is a tour operator: accommodation is an OPTION on a vacation
    // package, never a standalone product. A stay in the cart requires a
    // package in the same order.
    if (stayInputs.length && !input.items.some((it) => it.kind === "package")) {
      return {
        ok: false,
        error:
          "Accommodation is part of a vacation package — please add a package to your order along with your stay.",
      };
    }
    const candidateId = newOrderId(); // partnerRef for holds/requests + first insert attempt
    // Instant-book stays get a paid HOLD; request-to-book stays get a free
    // 72h REQUEST (owner approves first — we email a payment link after).
    const holdByLine: Record<string, { holdId: string; usd: number }> = {};
    const requestByLine: Record<string, { requestId: string; usd: number; expiresAt: string }> = {};
    const releaseHeld = () =>
      Promise.all(
        [
          ...Object.values(holdByLine).map((h) => h.holdId),
          ...Object.values(requestByLine).map((r) => r.requestId),
        ].map((id) => releaseTutcasaHold(id))
      ).then(
        () => {},
        () => {}
      );
    const stayFailure = (title: string, code: string) =>
      code === "DATES_TAKEN"
        ? `"${title}" was just booked for those dates. Please choose different dates or another home.`
        : code === "MIN_STAY_NOT_MET" || code === "INVALID_DATES" || code === "MAX_GUESTS_EXCEEDED" || code === "INVALID_CONTACT"
          ? `The details for "${title}" no longer fit this home — please re-select your stay.`
          : "We couldn't reach our accommodation partner. Please try again in a moment.";
    let rateUSD = 16.5;
    if (stayInputs.length) {
      const cur = await getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 16.5, rateEUR: 19.5 });
      if (cur.rateUSD > 0) rateUSD = cur.rateUSD;
      for (const it of stayInputs) {
        const slug = it.meta?.stay_slug;
        const ci = it.meta?.ci;
        const co = it.meta?.co;
        if (!slug || !ci || !co) {
          await releaseHeld();
          return { ok: false, error: "Your accommodation selection is incomplete — please re-add the stay." };
        }
        const guests = Math.max(1, Number(it.meta?.guests) || it.people || 1);

        const submitRequest = async (): Promise<string | null> => {
          const req = await createTutcasaRequest({
            slug,
            checkIn: ci,
            checkOut: co,
            guests,
            partnerRef: candidateId,
            guestName: input.name.trim(),
            guestEmail: input.email.trim(),
            guestWhatsapp: input.whatsapp?.trim() || undefined,
            notes: input.notes?.trim() || undefined,
          });
          if (!req.ok) {
            await releaseHeld();
            return stayFailure(it.title, req.error);
          }
          requestByLine[it.id] = { requestId: req.requestId, usd: req.quote.total, expiresAt: req.expiresAt };
          return null;
        };

        if (it.meta?.instant === "0") {
          const err = await submitRequest();
          if (err) return { ok: false, error: err };
        } else {
          const hold = await createTutcasaHold(slug, ci, co, guests, candidateId);
          if (hold.ok) {
            holdByLine[it.id] = { holdId: hold.holdId, usd: hold.quote.total };
          } else if (hold.error === "REQUEST_TO_BOOK") {
            // Defense in depth: the home switched to owner-approval since the
            // page loaded — fall back to the request flow instead of erroring.
            const err = await submitRequest();
            if (err) return { ok: false, error: err };
          } else {
            await releaseHeld();
            return { ok: false, error: stayFailure(it.title, hold.error) };
          }
        }
      }
    }

    // Server-side pricing: every line total is recomputed from OUR authoritative
    // prices, so the browser can never state the amount we charge. Tours use the
    // tour price list; packages are re-derived from the packages table + add-on
    // catalogue with the exact configurator math. Stays take the USD total from
    // the TutCasa hold just created. Airport-transfer lines stay 0 (confirmed
    // and charged by the team). Anything we can't price on the server keeps the
    // client value (harmless — those are "on request", not charged now).
    const items = await Promise.all(
      input.items.map(async (it) => {
        const people = Math.max(1, it.people || 1);
        if (it.kind === "tour" && it.meta?.tour_key) {
          // Group-tier pricing: the total for this group size (discount built
          // in), never a flat per-person multiplication.
          const serverTotal = await getTourLineTotal(it.meta.tour_key, people);
          if (serverTotal !== null) return { ...it, total: serverTotal };
        } else if (it.kind === "package" && it.meta?.pkgId && it.meta.pkgId !== "tour") {
          const addonIds = (it.meta.addon_ids ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s !== "None");
          const serverTotal = await getPackageLineTotal(it.meta.pkgId, people, addonIds);
          if (serverTotal !== null) return { ...it, total: serverTotal };
        } else if (it.kind === "activity" && it.meta?.activity_id) {
          // Single activities (Build Your Own Plan / tours-page singles) are
          // re-priced from the catalogue the same way.
          const serverTotal = await getActivityLineTotal(it.meta.activity_id, people);
          if (serverTotal !== null) return { ...it, total: serverTotal };
        } else if (it.kind === "stay") {
          const held = holdByLine[it.id];
          if (held)
            return {
              ...it,
              total: Math.round(held.usd * rateUSD),
              meta: { ...it.meta, tutcasa_hold_id: held.holdId, usd_total: String(held.usd), instant: "1" },
            };
          const requested = requestByLine[it.id];
          if (requested)
            // Request-to-book: NOTHING charged now — payment link goes out
            // once the owner confirms (72h window).
            return {
              ...it,
              total: 0,
              meta: {
                ...it.meta,
                tutcasa_request_id: requested.requestId,
                request_expires: requested.expiresAt,
                usd_total: String(requested.usd),
                stay_status: "requested",
                instant: "0",
              },
            };
        }
        return it;
      })
    );

    // Server-side totals: subtotal from (verified) line totals, discount
    // recomputed from the promo table against those verified totals — the
    // promo's conditions (min spend / min people / categories) are re-checked
    // here too, so neither the amount nor the eligibility comes from the client.
    const subtotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    let discount = 0;
    let discountLabel: string | undefined;
    let promoCode: string | undefined;
    if (input.promoCode?.trim()) {
      const res = await applyPromo(
        input.promoCode,
        items.map((it) => ({ kind: it.kind, total: Number(it.total) || 0, people: it.people }))
      );
      if (res.ok) {
        discount = res.amount;
        discountLabel = res.label;
        promoCode = res.code;
      }
    }
    const total = Math.max(0, subtotal - discount);

    // Attach the customer's account when they're logged in (guests stay null).
    const sessionUser = await getSessionUser();

    // Partner referral (?ref=tutcasa 30-day cookie) → commission tracking.
    const referrer = (await cookies()).get("amanah_ref")?.value?.toLowerCase() ?? null;

    const supabase = createAdminClient();
    const onlinePayment =
      total > 0 &&
      ((input.paymentMethodId === "stripe" && stripeConfigured) ||
        (input.paymentMethodId === "paypal" && paypalConfigured) ||
        (input.paymentMethodId === "mercadopago" && mercadoPagoConfigured));

    // An INSTANT stay must be paid online NOW — the hold only lives 60
    // minutes, so a "team will confirm later" order would lose the dates.
    // (Request stays charge nothing today, so they don't need this.)
    if (Object.keys(holdByLine).length && !onlinePayment) {
      await releaseHeld();
      return {
        ok: false,
        error: "Accommodation must be paid online — please choose card, PayPal or Mercado Pago.",
      };
    }

    // Insert with a fresh id; regenerate on the (rare) id collision. The first
    // attempt reuses the id already sent to TutCasa as partnerRef.
    let orderId: string | null = null;
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      const id = attempt === 0 ? candidateId : newOrderId();
      const { error } = await supabase.from("orders").insert({
        id,
        user_id: sessionUser?.id ?? null,
        status: onlinePayment ? "Pending payment" : "Pending confirmation",
        items,
        subtotal,
        discount,
        discount_label: discountLabel ?? null,
        promo_code: promoCode ?? null,
        total,
        payment_method: input.paymentMethod,
        customer_name: input.name.trim(),
        customer_email: input.email.trim(),
        customer_whatsapp: input.whatsapp?.trim() || null,
        notes: input.notes?.trim() || null,
        consent: true,
        consent_at: new Date().toISOString(),
        referrer: referrer === "tutcasa" ? referrer : null,
      });
      if (!error) orderId = id;
      else if (error.code !== "23505") {
        console.error("placeOrder:", error.message);
        return { ok: false, error: "We couldn't save your booking. Please try again." };
      }
    }
    if (!orderId) return { ok: false, error: "We couldn't save your booking. Please try again." };

    // Request-to-book stays: tell guest/Amanah/TutCasa a request is pending
    // (nothing charged for it — payment link follows owner approval).
    if (Object.keys(requestByLine).length) {
      await notifyStayRequests(
        { id: orderId, customer_name: input.name.trim(), customer_email: input.email.trim() },
        items
      ).catch(() => {});
    }

    // Notify customer + Amanah (best-effort; never blocks the booking).
    await notifyNewOrder({
      id: orderId,
      items,
      subtotal,
      discount,
      total,
      paymentMethod: input.paymentMethod,
      name: input.name.trim(),
      email: input.email.trim(),
      whatsapp: input.whatsapp?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      status: onlinePayment ? "Pending payment" : "Pending confirmation",
    }).catch(() => {});

    if (!onlinePayment) {
      return { ok: true, id: orderId, subtotal, discount, discountLabel, total };
    }

    // Online payment — the charge amount is always THIS server-computed total;
    // the browser never states a price to any payment provider.
    try {
      const hdrs = await headers();
      const origin =
        hdrs.get("origin") ??
        `${hdrs.get("x-forwarded-proto") ?? "http"}://${hdrs.get("host") ?? "localhost:3010"}`;
      let checkoutUrl: string;

      if (input.paymentMethodId === "paypal") {
        checkoutUrl = await createPayPalOrder(orderId, total, origin);
      } else if (input.paymentMethodId === "mercadopago") {
        checkoutUrl = await createMercadoPagoPreference(orderId, total, origin, input.email.trim());
      } else {
        const stripe = getStripe();
        const itemSummary = items
          .map((it) => `${it.title}${it.people ? ` (${it.people}p)` : ""}`)
          .join(" · ")
          .slice(0, 480);
        // With a request-to-book stay in the order, the card is saved (with
        // explicit notice at checkout) so we can charge the stay off-session
        // the moment the owner confirms — no second checkout for the guest.
        const hasRequestStay = Object.keys(requestByLine).length > 0;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          currency: "mxn",
          customer_email: input.email.trim(),
          ...(hasRequestStay
            ? {
                customer_creation: "always" as const,
                payment_intent_data: { setup_future_usage: "off_session" as const },
              }
            : {}),
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "mxn",
                unit_amount: total * 100,
                product_data: {
                  name: `Amanah Vacations — Booking ${orderId}`,
                  description: itemSummary || undefined,
                },
              },
            },
          ],
          metadata: { order_id: orderId },
          success_url: `${origin}/thank-you?id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout?cancelled=1`,
        });
        if (!session.url) throw new Error("Stripe session has no URL");
        checkoutUrl = session.url;
      }
      return { ok: true, id: orderId, subtotal, discount, discountLabel, total, checkoutUrl };
    } catch (e) {
      console.error(`placeOrder ${input.paymentMethodId}:`, e instanceof Error ? e.message : e);
      // Payment couldn't start. Keep the order (team can collect payment
      // manually) but free any TutCasa holds — the dates must not stay locked
      // for a payment that isn't happening; the team re-books the stay by hand.
      if (stayInputs.length) {
        await releaseTutcasaStays(items).catch(() => {});
        await supabase
          .from("orders")
          .update({
            status: "Pending confirmation",
            notes: `${input.notes?.trim() ? input.notes.trim() + "\n\n" : ""}⚠ Payment failed to start — TutCasa hold(s) released; re-arrange the stay manually.`,
          })
          .eq("id", orderId);
      } else {
        await supabase
          .from("orders")
          .update({ status: "Pending confirmation" })
          .eq("id", orderId);
      }
      return { ok: true, id: orderId, subtotal, discount, discountLabel, total };
    }
  } catch (e) {
    console.error("placeOrder:", e instanceof Error ? e.message : e);
    return { ok: false, error: "We couldn't save your booking. Please try again." };
  }
}

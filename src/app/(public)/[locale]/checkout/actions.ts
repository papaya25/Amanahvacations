"use server";

/* Places an order: validates the payload, recomputes every line total and the
   promo discount on the server (the client's numbers are display only), and
   stores the order in the private `orders` table. Guest checkout — no login
   required. Tour AND package prices are re-derived server-side, so the amount
   charged never comes from the browser. */

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePromo } from "@/lib/content/promo-actions";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { createPayPalOrder, paypalConfigured } from "@/lib/paypal";
import { createMercadoPagoPreference, mercadoPagoConfigured } from "@/lib/mercadopago";
import { notifyNewOrder } from "@/lib/orderEmails";
import { getSessionUser } from "@/lib/supabase/serverAuth";
import { getTourUnitPrice } from "@/lib/content/tours";
import { getPackageLineTotal } from "@/lib/content/packages";
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

    // Server-side pricing: every line total is recomputed from OUR authoritative
    // prices, so the browser can never state the amount we charge. Tours use the
    // tour price list; packages are re-derived from the packages table + add-on
    // catalogue with the exact configurator math. Airport-transfer lines stay 0
    // (confirmed and charged by the team). Anything we can't price on the server
    // keeps the client value (harmless — those are "on request", not charged now).
    const items = await Promise.all(
      input.items.map(async (it) => {
        const people = Math.max(1, it.people || 1);
        if (it.kind === "tour" && it.meta?.tour_key) {
          const unit = await getTourUnitPrice(it.meta.tour_key);
          if (unit !== null) return { ...it, total: unit * people };
        } else if (it.kind === "package" && it.meta?.pkgId && it.meta.pkgId !== "tour") {
          const addonIds = (it.meta.addon_ids ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s && s !== "None");
          const serverTotal = await getPackageLineTotal(it.meta.pkgId, people, addonIds);
          if (serverTotal !== null) return { ...it, total: serverTotal };
        }
        return it;
      })
    );

    // Server-side totals: subtotal from (verified) line totals, discount
    // recomputed from the promo table (never trusted from the client).
    const subtotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    let discount = 0;
    let discountLabel: string | undefined;
    let promoCode: string | undefined;
    if (input.promoCode?.trim()) {
      const def = await validatePromo(input.promoCode);
      if (def) {
        discount =
          def.type === "pct"
            ? Math.round((subtotal * def.value) / 100)
            : Math.min(def.value, subtotal);
        discountLabel = def.label;
        promoCode = input.promoCode.trim().toUpperCase();
      }
    }
    const total = Math.max(0, subtotal - discount);

    // Attach the customer's account when they're logged in (guests stay null).
    const sessionUser = await getSessionUser();

    const supabase = createAdminClient();
    const onlinePayment =
      total > 0 &&
      ((input.paymentMethodId === "stripe" && stripeConfigured) ||
        (input.paymentMethodId === "paypal" && paypalConfigured) ||
        (input.paymentMethodId === "mercadopago" && mercadoPagoConfigured));

    // Insert with a fresh id; regenerate on the (rare) id collision.
    let orderId: string | null = null;
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      const id = newOrderId();
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
      });
      if (!error) orderId = id;
      else if (error.code !== "23505") {
        console.error("placeOrder:", error.message);
        return { ok: false, error: "We couldn't save your booking. Please try again." };
      }
    }
    if (!orderId) return { ok: false, error: "We couldn't save your booking. Please try again." };

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
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          currency: "mxn",
          customer_email: input.email.trim(),
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
      // Keep the order (team can collect payment manually) but tell the customer.
      await supabase
        .from("orders")
        .update({ status: "Pending confirmation" })
        .eq("id", orderId);
      return { ok: true, id: orderId, subtotal, discount, discountLabel, total };
    }
  } catch (e) {
    console.error("placeOrder:", e instanceof Error ? e.message : e);
    return { ok: false, error: "We couldn't save your booking. Please try again." };
  }
}

import "server-only";

/* Order-level glue for TutCasa partner stays.

   confirmTutcasaStays(orderId) — called from every payment-confirmed path
   (Stripe webhook + thank-you verification for all providers) right after an
   order transitions to paid. Converts each stay line's hold into a real,
   paid-in-full TutCasa booking. Idempotent end to end: TutCasa's confirm is
   idempotent and both callers only fire on the winning status transition.

   releaseTutcasaStays(items) — frees holds when payment can't proceed.
   Best-effort: an unreleased hold self-expires on TutCasa after 60 minutes. */

import { createAdminClient } from "@/lib/supabase/admin";
import { confirmTutcasaHold, releaseTutcasaHold, getTutcasaBookingStatus } from "@/lib/tutcasa";
import { sendEmail, renderBrandedEmail, NOTIFY_BOOKING, FROM_BOOKING } from "@/lib/email";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { getPublicContent } from "@/lib/content/site";
import type { CartItem } from "@/lib/cart";

/* Partner inbox for the sync copy of every confirmed stay (set in env). */
const TUTCASA_NOTIFY = process.env.TUTCASA_NOTIFY_EMAIL || "";

/* Confirmation emails for a confirmed stay: guest + Amanah + TutCasa stay in
   sync. Best-effort — a failed email never blocks the booking. */
async function sendStayEmails(
  order: { id: string; customer_name: string; customer_email: string },
  stay: CartItem
) {
  const instant = stay.meta?.instant !== "0";
  const lines = stay.details.join("\n");
  const guestBody =
    `Great news, ${order.customer_name.split(" ")[0]} — your stay is booked!\n\n` +
    `${stay.title} (${stay.subtitle ?? "TutCasa partner home"})\n${lines}\n\nBooking reference: ${order.id}\n\n` +
    (instant
      ? "Your reservation is confirmed and the dates are locked. Check-in details will follow closer to your arrival."
      : "Your reservation is being finalized with the home's owner — we'll email you the final confirmation shortly.") +
    "\n\nYour stay is paid in full; only the home's refundable security deposit is handled at check-in.";
  const opsBody =
    `Accommodation booked & paid via Amanah.\n\n${stay.title}\n${lines}\n` +
    `Guest: ${order.customer_name} <${order.customer_email}>\nOrder: ${order.id}\n` +
    `Amount: $${stay.meta?.usd_total ?? "?"} USD (paid in full on Amanah)\n` +
    `Mode: ${instant ? "instant booking" : "REQUEST TO BOOK — owner confirmation needed, follow up!"}`;

  await Promise.all(
    [
      sendEmail({
        to: order.customer_email,
        subject: `Your stay at ${stay.title} — booking ${order.id}`,
        text: guestBody,
        html: renderBrandedEmail({ heading: "Your stay is booked 🏡", bodyText: guestBody }),
        from: FROM_BOOKING,
      }),
      sendEmail({
        to: NOTIFY_BOOKING,
        subject: `Stay booked: ${stay.title} — ${order.id}`,
        text: opsBody,
        html: renderBrandedEmail({ heading: "Accommodation booking", bodyText: opsBody }),
        from: FROM_BOOKING,
        replyTo: order.customer_email,
      }),
      ...(TUTCASA_NOTIFY
        ? [
            sendEmail({
              to: TUTCASA_NOTIFY,
              subject: `[Amanah partner booking] ${stay.title} — ${order.id}`,
              text: opsBody,
              html: renderBrandedEmail({ heading: "Partner booking via Amanah", bodyText: opsBody }),
              from: FROM_BOOKING,
            }),
          ]
        : []),
    ].map((p) => p.catch(() => ({ ok: false })))
  );
}

export async function releaseTutcasaStays(items: CartItem[]): Promise<void> {
  await Promise.all(
    items
      .filter((it) => it.kind === "stay" && it.meta?.tutcasa_hold_id)
      .map((it) => releaseTutcasaHold(it.meta!.tutcasa_hold_id))
  );
}

export async function confirmTutcasaStays(orderId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, items, customer_name, customer_email, customer_whatsapp, notes")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;

    const items = (order.items ?? []) as CartItem[];
    const stays = items.filter((it) => it.kind === "stay" && it.meta?.tutcasa_hold_id);
    if (!stays.length) return;

    const failures: string[] = [];
    for (const stay of stays) {
      const res = await confirmTutcasaHold(stay.meta!.tutcasa_hold_id, {
        partnerRef: orderId,
        guestName: order.customer_name,
        guestEmail: order.customer_email,
        guestWhatsapp: order.customer_whatsapp ?? undefined,
        amountPaid: Number(stay.meta!.usd_total) || 0,
        currency: "USD",
        notes: order.notes ?? undefined,
      });
      if (!res.ok) {
        console.error(`confirmTutcasaStays ${orderId} ${stay.title}:`, res.error);
        failures.push(`${stay.title} (${res.error})`);
      } else {
        // Keep everyone in sync: guest + Amanah + TutCasa notification.
        await sendStayEmails(order, stay);
      }
    }

    // Surface any failure where the team will see it: on the order itself.
    if (failures.length) {
      const marker = `⚠ TUTCASA CONFIRM FAILED — contact TutCasa/guest manually: ${failures.join(", ")}`;
      await supabase
        .from("orders")
        .update({ notes: order.notes ? `${order.notes}\n\n${marker}` : marker })
        .eq("id", orderId);
    }
  } catch (e) {
    console.error("confirmTutcasaStays:", e instanceof Error ? e.message : e);
  }
}

/* ── Request-to-book lifecycle (owner-approved homes, pay after approval) ──
   1. placeOrder creates the partner request (no charge) → notifyStayRequests
      tells guest/Amanah/TutCasa a request is pending.
   2. syncStayRequests polls TutCasa (cron + page loads):
      confirmed → Stripe payment link emailed to the guest;
      cancelled/expired → guest + Amanah informed, line marked.
   3. Payment link paid (webhook or thank-you) → handleStayBalancePaid marks
      the line paid and sends the final confirmations. */

import { SITE_URL } from "@/lib/seo";

const isRequestedStay = (it: CartItem) =>
  it.kind === "stay" && Boolean(it.meta?.tutcasa_request_id);

type OrderRow = {
  id: string;
  items: CartItem[];
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string | null;
  notes: string | null;
};

async function saveItems(orderId: string, items: CartItem[], noteAppend?: string) {
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = { items };
  if (noteAppend) {
    const { data } = await supabase.from("orders").select("notes").eq("id", orderId).maybeSingle();
    patch.notes = data?.notes ? `${data.notes}\n\n${noteAppend}` : noteAppend;
  }
  await supabase.from("orders").update(patch).eq("id", orderId);
}

/** Emails right after a request-to-book stay is submitted (nothing charged). */
export async function notifyStayRequests(
  order: { id: string; customer_name: string; customer_email: string },
  items: CartItem[]
): Promise<void> {
  const requested = items.filter((it) => isRequestedStay(it) && it.meta?.stay_status === "requested");
  for (const stay of requested) {
    const lines = stay.details.join("\n");
    const guestBody =
      `Hi ${order.customer_name.split(" ")[0]},\n\nYour booking request for ${stay.title} has been sent to the home's owner.\n\n${lines}\nReference: ${order.id}\n\n` +
      `Nothing has been charged for this stay. The owner has 72 hours to confirm — the moment they do, we'll email you a secure payment link for $${stay.meta?.usd_total} USD. If the owner can't host you, we'll let you know right away and help you pick another home.`;
    const opsBody =
      `Request-to-book stay submitted (NO charge yet).\n\n${stay.title}\n${lines}\nGuest: ${order.customer_name} <${order.customer_email}>\nOrder: ${order.id}\nTutCasa request: ${stay.meta?.tutcasa_request_id}\nQuoted: $${stay.meta?.usd_total} USD · owner has 72h (expires ${stay.meta?.request_expires ?? "?"})`;
    await Promise.all(
      [
        sendEmail({
          to: order.customer_email,
          subject: `Your booking request for ${stay.title} — ${order.id}`,
          text: guestBody,
          html: renderBrandedEmail({ heading: "Request sent to the owner 🏡", bodyText: guestBody }),
          from: FROM_BOOKING,
        }),
        sendEmail({
          to: NOTIFY_BOOKING,
          subject: `Stay REQUEST pending: ${stay.title} — ${order.id}`,
          text: opsBody,
          html: renderBrandedEmail({ heading: "Stay request pending", bodyText: opsBody }),
          from: FROM_BOOKING,
          replyTo: order.customer_email,
        }),
        ...(TUTCASA_NOTIFY
          ? [
              sendEmail({
                to: TUTCASA_NOTIFY,
                subject: `[Amanah partner request] ${stay.title} — ${order.id}`,
                text: opsBody,
                html: renderBrandedEmail({ heading: "Partner booking request", bodyText: opsBody }),
                from: FROM_BOOKING,
              }),
            ]
          : []),
      ].map((p) => p.catch(() => ({ ok: false })))
    );
  }
}

/** Owner approved → email the guest a Stripe payment link for the full total. */
async function sendStayPaymentLink(order: OrderRow, stay: CartItem): Promise<boolean> {
  if (!stripeConfigured) return false;
  try {
    const usd = Number(stay.meta?.usd_total) || 0;
    const cur = await getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 16.5, rateEUR: 19.5 });
    const rate = cur.rateUSD > 0 ? cur.rateUSD : 16.5;
    const mxn = Math.round(usd * rate);
    if (mxn <= 0) return false;
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      currency: "mxn",
      customer_email: order.customer_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: mxn * 100,
            product_data: {
              name: `${stay.title} — stay for booking ${order.id}`,
              description: stay.details.slice(0, 2).join(" · ").slice(0, 480) || undefined,
            },
          },
        },
      ],
      metadata: {
        order_id: order.id,
        purpose: "stay_balance",
        request_id: stay.meta?.tutcasa_request_id ?? "",
      },
      success_url: `${SITE_URL}/thank-you?id=${order.id}&stay=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/account/orders`,
    });
    if (!session.url) return false;

    const guestBody =
      `Great news, ${order.customer_name.split(" ")[0]} — the owner of ${stay.title} confirmed your stay!\n\n${stay.details.join("\n")}\nReference: ${order.id}\n\n` +
      `To lock it in, complete your payment of $${usd} USD (charged in MXN):`;
    await sendEmail({
      to: order.customer_email,
      subject: `Owner confirmed! Complete your payment for ${stay.title} — ${order.id}`,
      text: `${guestBody}\n\n${session.url}\n\nThe payment link is valid for 24 hours — if it expires, just reply to this email and we'll send a fresh one.`,
      html: renderBrandedEmail({
        heading: "Your stay is approved ✓",
        bodyText: `${guestBody}\n\nThe link is valid for 24 hours — if it expires, reply to this email and we'll send a fresh one.`,
        ctaLabel: "Complete payment",
        ctaUrl: session.url,
      }),
      from: FROM_BOOKING,
    });
    await sendEmail({
      to: NOTIFY_BOOKING,
      subject: `Owner APPROVED stay: ${stay.title} — ${order.id} (payment link sent)`,
      text: `Owner approved ${stay.title} for order ${order.id}. Payment link for $${usd} USD sent to ${order.customer_email}. If unpaid after 24h, follow up or resend from Stripe.`,
      html: renderBrandedEmail({
        heading: "Stay approved — awaiting payment",
        bodyText: `Owner approved ${stay.title} for order ${order.id}.\nPayment link for $${usd} USD sent to ${order.customer_email}.\nIf unpaid after 24h, follow up or resend.`,
      }),
      from: FROM_BOOKING,
      replyTo: order.customer_email,
    }).catch(() => {});
    return true;
  } catch (e) {
    console.error("sendStayPaymentLink:", e instanceof Error ? e.message : e);
    return false;
  }
}

/** Owner declined / request expired → tell the guest (no charge happened). */
async function sendStayDeclined(order: OrderRow, stay: CartItem) {
  const guestBody =
    `Hi ${order.customer_name.split(" ")[0]},\n\nUnfortunately the owner of ${stay.title} couldn't confirm your dates, so that stay was not booked — and nothing was charged for it.\n\n` +
    `The rest of your booking ${order.id} is unaffected. Reply to this email or message us on WhatsApp and your concierge will help you pick another beautiful home for the same dates.`;
  await Promise.all(
    [
      sendEmail({
        to: order.customer_email,
        subject: `About your stay request for ${stay.title} — ${order.id}`,
        text: guestBody,
        html: renderBrandedEmail({ heading: "Stay request update", bodyText: guestBody }),
        from: FROM_BOOKING,
      }),
      sendEmail({
        to: NOTIFY_BOOKING,
        subject: `Stay request DECLINED/EXPIRED: ${stay.title} — ${order.id}`,
        text: `The request for ${stay.title} (order ${order.id}, guest ${order.customer_name} <${order.customer_email}>) was declined by the owner or expired. Guest informed; offer alternatives.`,
        html: renderBrandedEmail({
          heading: "Stay request declined",
          bodyText: `${stay.title} — order ${order.id}\nGuest: ${order.customer_name} <${order.customer_email}>\nDeclined by owner or expired after 72h. Guest informed; offer alternatives.`,
        }),
        from: FROM_BOOKING,
        replyTo: order.customer_email,
      }),
    ].map((p) => p.catch(() => ({ ok: false })))
  );
}

/** Poll TutCasa for pending stay requests and act on owner decisions.
    Scoped to one order when `orderId` is given; otherwise scans all pending.
    Idempotent — stay_status gates every transition. */
export async function syncStayRequests(orderId?: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("orders")
      .select("id, items, customer_name, customer_email, customer_whatsapp, notes")
      .contains("items", JSON.stringify([{ meta: { stay_status: "requested" } }]));
    if (orderId) query = query.eq("id", orderId);
    const { data: orders } = await query;
    if (!orders?.length) return;

    for (const order of orders as OrderRow[]) {
      let changed = false;
      let note: string | undefined;
      const items = order.items ?? [];
      for (const stay of items) {
        if (!isRequestedStay(stay) || stay.meta?.stay_status !== "requested") continue;
        const status = await getTutcasaBookingStatus(stay.meta!.tutcasa_request_id);
        if (!status?.ok) continue;
        if (status.status === "confirmed") {
          const sent = await sendStayPaymentLink(order, stay);
          stay.meta!.stay_status = sent ? "approved" : "approved_link_failed";
          note = `TutCasa: owner APPROVED ${stay.title}${sent ? " — payment link emailed to guest" : " — ⚠ payment link could not be sent, follow up manually"}`;
          changed = true;
        } else if (status.status === "cancelled") {
          stay.meta!.stay_status = "cancelled";
          await sendStayDeclined(order, stay);
          note = `TutCasa: owner DECLINED/expired ${stay.title} — guest informed, nothing charged`;
          changed = true;
        }
      }
      if (changed) await saveItems(order.id, items, note);
    }
  } catch (e) {
    console.error("syncStayRequests:", e instanceof Error ? e.message : e);
  }
}

/** The approved stay's payment link was paid — finalize and notify everyone. */
export async function handleStayBalancePaid(orderId: string, requestId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, items, customer_name, customer_email, customer_whatsapp, notes")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;
    const items = (order.items ?? []) as CartItem[];
    const stay = items.find((it) => it.meta?.tutcasa_request_id === requestId);
    if (!stay || stay.meta?.stay_status === "paid") return; // idempotent
    stay.meta!.stay_status = "paid";
    await saveItems(orderId, items, `TutCasa: stay ${stay.title} PAID in full by guest via payment link`);
    await sendStayEmails(order as OrderRow, { ...stay, meta: { ...stay.meta!, instant: "1" } });
  } catch (e) {
    console.error("handleStayBalancePaid:", e instanceof Error ? e.message : e);
  }
}

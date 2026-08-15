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
import { confirmTutcasaHold, releaseTutcasaHold } from "@/lib/tutcasa";
import { sendEmail, renderBrandedEmail, NOTIFY_BOOKING, FROM_BOOKING } from "@/lib/email";
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

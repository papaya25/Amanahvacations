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
import type { CartItem } from "@/lib/cart";

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

import "server-only";

/* Commission math for partner intermediaries (TutCasa first).

   WE OWE TUTCASA — tours/activities booked by TutCasa-referred customers
   (orders.referrer === 'tutcasa', stamped from the ?ref=tutcasa cookie):
   5% of the line total for groups of up to 2, 10% for 3 or more. Manual
   entries (referrals outside the website) are added client-side from the
   admin-managed list.

   TUTCASA OWES US — 10% of every PAID TutCasa stay booked on Amanah
   (instant stays on realized orders; request stays once their payment is
   collected). Stay prices are USD on TutCasa's side, so commission is
   tracked in USD with an MXN approximation at the configured rate. */

import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicContent } from "@/lib/content/site";
import type { CartItem } from "@/lib/cart";
import { tourRatePct, STAY_COMMISSION_PCT, type OwedToRow, type OwedByRow } from "./shared";

export type { OwedToRow, OwedByRow };

const monthOf = (iso: string) => iso.slice(0, 7);

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  referrer: string | null;
  customer_name: string;
  items: CartItem[];
};

/** Orders that represent real (not cancelled / never-paid) business. */
const realized = (status: string) => status !== "Cancelled" && status !== "Pending payment";

export async function getCommissionData(): Promise<{
  owedTo: OwedToRow[];
  owedBy: OwedByRow[];
  rateUSD: number;
}> {
  const supabase = createAdminClient();
  const cur = await getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 16.5, rateEUR: 19.5 });
  const rateUSD = cur.rateUSD > 0 ? cur.rateUSD : 16.5;

  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, referrer, customer_name, items")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("getCommissionData:", error.message);
    return { owedTo: [], owedBy: [], rateUSD };
  }

  const owedTo: OwedToRow[] = [];
  const owedBy: OwedByRow[] = [];

  for (const order of (data ?? []) as OrderRow[]) {
    const date = order.created_at.slice(0, 10);
    const month = monthOf(order.created_at);

    for (const it of order.items ?? []) {
      // Direction 1: TutCasa sent us the customer → tour/activity commission.
      if (
        order.referrer === "tutcasa" &&
        realized(order.status) &&
        (it.kind === "tour" || it.kind === "activity") &&
        (Number(it.total) || 0) > 0
      ) {
        const people = Math.max(1, it.people || 1);
        const amountMXN = Number(it.total) || 0;
        const ratePct = tourRatePct(people);
        owedTo.push({
          month,
          date,
          orderId: order.id,
          title: it.title,
          people,
          amountMXN,
          ratePct,
          commissionMXN: Math.round((amountMXN * ratePct) / 100),
        });
      }

      // Direction 2: a TutCasa home booked on Amanah → 10% to us, once PAID.
      if (it.kind === "stay" && it.meta?.stay_slug) {
        const instant = it.meta.instant !== "0";
        const paid = instant ? realized(order.status) : it.meta.stay_status === "paid";
        if (!paid) continue;
        const amountUSD = Number(it.meta.usd_total) || 0;
        if (amountUSD <= 0) continue;
        const commissionUSD = Math.round((amountUSD * STAY_COMMISSION_PCT) / 100);
        owedBy.push({
          month,
          date,
          orderId: order.id,
          title: it.title,
          guest: order.customer_name,
          amountUSD,
          commissionUSD,
          commissionMXN: Math.round(commissionUSD * rateUSD),
        });
      }
    }
  }

  return { owedTo, owedBy, rateUSD };
}

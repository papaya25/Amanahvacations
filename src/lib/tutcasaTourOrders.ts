import "server-only";

/* A TutCasa tour booking also lives in Orders & Bookings (and so in the
   dashboard, calendar and Accounting) with everything pre-filled:
   referred by TutCasa (commission), payment collected later. One order per
   TutCasa booking (id TCT-<booking>), kept in step with the queue decisions. */

import { createAdminClient } from "@/lib/supabase/admin";
import { getSavedTours, getTourLineTotal } from "@/lib/content/tours";
import { getPublicContent } from "@/lib/content/site";

export const tourOrderId = (bookingId: string) => `TCT-${bookingId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`;

/** "MX$7,400" / "$7,400 MXN" / "USD 450" → MXN (last number in the label). */
export function parseTotalLabel(label: string | null, rateUSD: number): number {
  const nums = (label ?? "").match(/\d[\d,]*(?:\.\d+)?/g);
  if (!nums) return 0;
  const n = Number(nums[nums.length - 1].replace(/,/g, "")) || 0;
  return Math.round(/usd|us\$/i.test(label ?? "") ? n * rateUSD : n);
}

export async function mirrorTourBookingToOrder(b: {
  bookingId: string;
  ref: string;
  tourTitle: string;
  tourDate: string | null;
  groupSize: number | null;
  totalLabel: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  notes: string | null;
  status: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const id = tourOrderId(b.bookingId);
  const { data: existing } = await supabase.from("orders").select("status").eq("id", id).maybeSingle();
  // Once the team has acted on it (confirmed, completed…), the order is theirs.
  if (existing && existing.status !== "Pending confirmation") return;

  const people = Math.max(1, b.groupSize || 1);
  const [tours, cur] = await Promise.all([
    getSavedTours(),
    getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 16.5, rateEUR: 19.5 }),
  ]);
  const title = b.tourTitle.trim();
  const tour = (tours ?? []).find((t) => t.name.toLowerCase() === title.toLowerCase())
    ?? (tours ?? []).find((t) => title.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(title.toLowerCase()));
  const total =
    parseTotalLabel(b.totalLabel, cur.rateUSD > 0 ? cur.rateUSD : 16.5) ||
    (tour ? (await getTourLineTotal(tour.key, people)) ?? 0 : 0);
  const cancelled = /cancel/i.test(b.status ?? "");

  const row = {
    id,
    status: cancelled ? "Cancelled" : "Pending confirmation",
    source: "tutcasa",
    referrer: "tutcasa",
    items: [
      {
        id: "t1",
        kind: "tour",
        title,
        subtitle: `TutCasa booking ${b.ref}`,
        details: [b.tourDate ?? "Date to confirm", `${people} ${people === 1 ? "person" : "people"}`, ...(b.totalLabel ? [`TutCasa price: ${b.totalLabel}`] : [])],
        total,
        people,
        meta: { currency: "MXN", date: b.tourDate ?? "", tutcasa_booking_id: b.bookingId, ...(tour ? { tour_key: tour.key } : {}) },
      },
    ],
    subtotal: total,
    discount: 0,
    total,
    payment_method: "To be collected",
    customer_name: b.guestName ?? "TutCasa guest",
    customer_email: b.guestEmail ?? "",
    customer_whatsapp: b.guestPhone,
    notes: [`Booked on TutCasa (ref ${b.ref}).`, b.notes].filter(Boolean).join(" "),
    consent: false,
  };
  const { error } = existing
    ? await supabase.from("orders").update(row).eq("id", id)
    : await supabase.from("orders").insert(row);
  if (error) console.error("mirrorTourBookingToOrder:", error.message);
}

/** Queue decision → order status (accept → Confirmed, deny → Cancelled). */
export async function syncTourOrderStatus(bookingId: string, status: "Confirmed" | "Cancelled"): Promise<void> {
  await createAdminClient().from("orders").update({ status }).eq("id", tourOrderId(bookingId));
}

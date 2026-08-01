/* Tours content — written by /admin/tours into site_content key "tours".
   The public /tours page keeps its built-in tour list until the admin saves;
   after that the admin's list drives cards, prices, offers and itineraries.

   PRICING MODEL: tours are priced by GROUP SIZE, not per person × people.
   Each tour carries `prices` — total MXN per pax count (2–6; Cozumel starts
   at 3) — with the group discount built in: a bigger group pays less per
   person. The legacy flat `price`/`offer` fields remain as a fallback for
   any saved tour that predates tiers. */

import { getSavedContent } from "@/lib/content/site";
import { TOURS, parseTierPrices, tourTotalFor } from "@/app/(public)/[locale]/tours/data";

export type TourStop = { time: string; place: string; desc: string };

export type AdminTour = {
  key: string;
  name: string;
  sub: string;
  dur: string;
  /** Legacy per-person price (fallback when `prices` is missing). */
  price: number;
  /** Legacy per-person offer (fallback pricing only). */
  offer: number;
  /** Total group price (MXN) keyed by pax count, e.g. {"2":6200,"3":8400}.
      JSON object keys are strings. Smallest key = minimum group size. */
  prices?: Record<string, number>;
  onreq: boolean;
  hidden: boolean;
  img: string;
  stops: TourStop[];
};

/** Saved tours (visible only, in saved order), or null if never saved. */
export async function getSavedTours(): Promise<AdminTour[] | null> {
  const saved = await getSavedContent<{ tours: AdminTour[] }>("tours");
  if (!saved?.tours?.length) return null;
  return saved.tours.filter((t) => !t.hidden);
}

/** Authoritative TOTAL price (MXN) for a tour booked for `people`, from the
    admin-saved tiers (or built-in tiers before any save). Group sizes outside
    the offered tiers clamp to the nearest tier — below-minimum pays the
    minimum-group price. Returns null for on-request/unknown tours (those are
    never charged online). Used at checkout so a tampered browser can never
    change the amount actually charged. */
export async function getTourLineTotal(key: string, people: number): Promise<number | null> {
  const saved = await getSavedTours();
  if (saved) {
    const t = saved.find((x) => x.key === key);
    if (!t || t.onreq) return null;
    const tiers = parseTierPrices(t.prices);
    if (tiers) return tourTotalFor({ groupPrices: tiers, price: null }, people);
    // Legacy saved tour without tiers: flat per-person price × people.
    if (t.price <= 0) return null;
    const unit = t.offer > 0 && t.offer < t.price ? t.offer : t.price;
    return unit * Math.max(1, people);
  }
  const builtin = TOURS.find((x) => x.key === key);
  if (!builtin || builtin.onreq) return null;
  return tourTotalFor(builtin, people);
}

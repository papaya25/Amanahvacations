/* Tours content — written by /admin/tours into site_content key "tours".
   The public /tours page keeps its built-in tour list until the admin saves;
   after that the admin's list drives cards, prices, offers and itineraries. */

import { getSavedContent } from "@/lib/content/site";

export type TourStop = { time: string; place: string; desc: string };

export type AdminTour = {
  key: string;
  name: string;
  sub: string;
  dur: string;
  price: number;
  offer: number;
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

/* Built-in per-person prices (MXN), mirroring the public tour list — used to
   verify checkout amounts server-side when the admin hasn't saved tours yet. */
const DEFAULT_TOUR_PRICING: Record<string, { price: number; offer?: number }> = {
  akumalcenotes: { price: 2350 },
  tulumcenotes: { price: 3700 },
  cobacenotes: { price: 3900 },
  cozumel: { price: 4600 },
  akumaltulum: { price: 5850 },
  chichen: { price: 6600, offer: 5500 },
  rutacenotes: { price: 2900 },
};

/** Authoritative per-person price for a tour (offer wins when valid), or null
    for on-request/unknown tours (those aren't charged online). */
export async function getTourUnitPrice(key: string): Promise<number | null> {
  const saved = await getSavedTours();
  if (saved) {
    const t = saved.find((x) => x.key === key);
    if (!t || t.onreq || t.price <= 0) return null;
    return t.offer > 0 && t.offer < t.price ? t.offer : t.price;
  }
  const d = DEFAULT_TOUR_PRICING[key];
  if (!d) return null;
  return d.offer && d.offer < d.price ? d.offer : d.price;
}

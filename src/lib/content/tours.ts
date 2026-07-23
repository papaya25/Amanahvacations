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

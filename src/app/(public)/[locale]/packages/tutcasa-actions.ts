"use server";

/* Server actions bridging the packages configurator to the TutCasa partner
   API. The client only ever talks to our server; our server talks to TutCasa
   (keeps caching in our control, no browser CORS waterfalls). Loaded lazily —
   the catalog is only requested once the guest picks the Airbnb/Villa tier. */

import {
  getTutcasaCatalog,
  getTutcasaQuote,
  type TutcasaListing,
  type TutcasaQuote,
} from "@/lib/tutcasa";

export async function fetchTutcasaHomes(): Promise<TutcasaListing[]> {
  return getTutcasaCatalog();
}

export async function fetchTutcasaQuote(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<TutcasaQuote | null> {
  if (!slug || !checkIn || !checkOut) return null;
  return getTutcasaQuote(slug, checkIn, checkOut, guests);
}

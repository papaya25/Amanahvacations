import "server-only";

/* TutCasa partner API — accommodation catalog + live availability/quotes.
   Read-only public data. Fetched server-side only: the catalog is cached for
   5 minutes (matching TutCasa's own s-maxage), detail/quote calls are always
   fresh. Prices come all-in from TutCasa and are NEVER recomputed on our side
   (partner brand promise). Booking itself happens on TutCasa via bookUrl. */

const BASE = process.env.TUTCASA_API_BASE || "https://tutcasa-platform.vercel.app";

export type TutcasaListing = {
  slug: string;
  title: string;
  city: string;
  country: string;
  region: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  headline: string;
  description: string;
  amenities: string[];
  minStay: number;
  instantBook: boolean;
  featured: boolean;
  rating: number | null;
  reviewCount: number;
  checkinFrom: string;
  checkoutUntil: string;
  pricing: {
    nightly: number;
    cleaningFee: number;
    taxPct: number;
    allInNightly: number;
    currency: string;
  };
  photos: { url: string; alt: string }[];
  /** Absolute URL to book this home on TutCasa (new tab). */
  bookUrl: string;
};

export type TutcasaQuote =
  | {
      ok: true;
      nights: number;
      currency: string;
      total: number;
      dueNow: number;
      balance: number;
      balanceDueDate: string;
      securityDeposit: number;
    }
  | { ok: false; error: "DATES_TAKEN" | "MIN_STAY_NOT_MET" | "INVALID_DATES" | string };

type RawListing = Omit<TutcasaListing, "bookUrl"> & { bookUrl: string; detailUrl: string };

/** Published MX homes (Amanah trips are Riviera Maya), featured first. */
export async function getTutcasaCatalog(): Promise<TutcasaListing[]> {
  try {
    const res = await fetch(`${BASE}/api/accommodation`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { listings?: RawListing[] };
    return (data.listings ?? [])
      .filter((l) => l.country === "MX")
      .map((l) => ({ ...l, bookUrl: `${BASE}${l.bookUrl}` }));
  } catch {
    return []; // partner down → the panel simply doesn't show homes
  }
}

/** Live quote for one home; TutCasa computes the price server-side. */
export async function getTutcasaQuote(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<TutcasaQuote | null> {
  try {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(Math.max(1, guests)),
    });
    const res = await fetch(
      `${BASE}/api/accommodation/${encodeURIComponent(slug)}?${params}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { quote?: TutcasaQuote | null };
    return data.quote ?? null;
  } catch {
    return null;
  }
}

/** Book link with the guest's dates/party prefilled (TutCasa reads ci/co/guests). */
export function withBookingParams(bookUrl: string, ci?: string, co?: string, guests?: number) {
  if (!ci || !co) return bookUrl;
  const params = new URLSearchParams({ ci, co, guests: String(Math.max(1, guests ?? 1)) });
  return `${bookUrl}?${params}`;
}

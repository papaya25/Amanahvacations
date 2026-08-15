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

/* ── Partner booking API (hold → confirm → release) ──────────────────────
   Server-to-server only, authenticated with the shared TUTCASA_PARTNER_KEY.
   TutCasa is the calendar source of truth: a hold locks the dates for 60
   minutes while the guest pays on Amanah; confirm turns it into a real,
   paid-in-full TutCasa booking; release (or expiry) frees the dates. */

const PARTNER_KEY = process.env.TUTCASA_PARTNER_KEY || "";

export type TutcasaHold =
  | {
      ok: true;
      holdId: string;
      expiresAt: string;
      quote: { nights: number; currency: string; total: number };
    }
  | { ok: false; error: string };

async function partnerPost(path: string, body?: unknown): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json", "x-partner-key": PARTNER_KEY },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return (await res.json().catch(() => null)) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

export async function createTutcasaHold(
  slug: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  partnerRef: string
): Promise<TutcasaHold> {
  const data = await partnerPost("/api/partner/holds", {
    slug,
    checkIn,
    checkOut,
    guests: Math.max(1, guests),
    partnerRef,
  });
  if (data?.ok && typeof data.holdId === "string") return data as unknown as TutcasaHold;
  const error = typeof data?.error === "string" ? data.error : "UNAVAILABLE";
  return { ok: false, error };
}

export async function confirmTutcasaHold(
  holdId: string,
  payload: {
    partnerRef: string;
    guestName: string;
    guestEmail: string;
    guestWhatsapp?: string;
    amountPaid: number;
    currency: string;
    notes?: string;
  }
): Promise<{ ok: boolean; bookingId?: string; error?: string }> {
  const data = await partnerPost(`/api/partner/holds/${encodeURIComponent(holdId)}/confirm`, payload);
  if (data?.ok) return { ok: true, bookingId: typeof data.bookingId === "string" ? data.bookingId : undefined };
  return { ok: false, error: typeof data?.error === "string" ? data.error : "CONFIRM_FAILED" };
}

/** Best-effort and idempotent on the TutCasa side — safe to call repeatedly. */
export async function releaseTutcasaHold(holdId: string): Promise<void> {
  await partnerPost(`/api/partner/holds/${encodeURIComponent(holdId)}/release`);
}

/* ── Request-to-book (owner-approved homes, no payment upfront) ────────── */

export type TutcasaRequest =
  | {
      ok: true;
      requestId: string;
      status: string;
      expiresAt: string;
      quote: { nights: number; currency: string; total: number };
    }
  | { ok: false; error: string };

/** Create a pending 72h booking request (holds the dates while the owner
    decides in TutCasa's admin). Nothing is charged at this point. */
export async function createTutcasaRequest(payload: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  partnerRef: string;
  guestName: string;
  guestEmail: string;
  guestWhatsapp?: string;
  notes?: string;
}): Promise<TutcasaRequest> {
  const data = await partnerPost("/api/partner/requests", {
    ...payload,
    guests: Math.max(1, payload.guests),
  });
  if (data?.ok && typeof data.requestId === "string") return data as unknown as TutcasaRequest;
  return { ok: false, error: typeof data?.error === "string" ? data.error : "UNAVAILABLE" };
}

export type TutcasaBookingStatus = {
  ok: boolean;
  bookingId?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  total?: number;
  currency?: string;
  amountPaid?: number;
};

/** Poll a hold/request/booking's current state. */
export async function getTutcasaBookingStatus(id: string): Promise<TutcasaBookingStatus | null> {
  try {
    const res = await fetch(`${BASE}/api/partner/bookings/${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: { "x-partner-key": PARTNER_KEY },
    });
    if (!res.ok) return null;
    return (await res.json()) as TutcasaBookingStatus;
  } catch {
    return null;
  }
}

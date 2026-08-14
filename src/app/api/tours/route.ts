import { NextResponse } from "next/server";
import { getSavedTours } from "@/lib/content/tours";
import { TOURS, parseTierPrices } from "@/app/(public)/[locale]/tours/data";

export const dynamic = "force-dynamic";

/**
 * Public tour catalog — consumed by tutcasa.com so its Tours & Parks
 * section mirrors Amanah 1:1 (same tours, same images, same group-tier
 * prices, zero markup). Admin-saved tours win; the built-in catalog is
 * the fallback, exactly like the public /tours page.
 *
 * Pricing model: `groupPrices` maps group size → TOTAL price in MXN
 * (group discount built in; smallest key = minimum bookable group).
 * `price`/`offer` are the legacy per-person fallback. `onreq` tours are
 * arranged personally and never charged online.
 */

interface ApiStop { time: string; place: string; desc: string }
interface ApiTour {
  key: string;
  name: string;
  sub: string;
  dur: string;
  groupPrices: Record<number, number> | null;
  price: number | null;   // legacy per-person MXN
  offer: number | null;   // legacy per-person sale MXN
  onreq: boolean;
  img: string | null;     // absolute URL
  stops: ApiStop[];
}

function absolute(req: Request, img: string | undefined | null): string | null {
  if (!img) return null;
  if (/^https?:\/\//.test(img)) return img;
  const origin = new URL(req.url).origin;
  return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
}

export async function GET(req: Request) {
  const saved = await getSavedTours();

  const tours: ApiTour[] = saved
    ? saved.map((t) => ({
        key: t.key,
        name: t.name,
        sub: t.sub,
        dur: t.dur,
        groupPrices: parseTierPrices(t.prices),
        price: t.price > 0 ? t.price : null,
        offer: t.offer > 0 && t.offer < t.price ? t.offer : null,
        onreq: !!t.onreq,
        img: absolute(req, t.img),
        stops: (t.stops ?? []).map((s) => ({ time: s.time, place: s.place, desc: s.desc })),
      }))
    : TOURS.filter((t): t is typeof t & { key: string } => !!t.key).map((t) => ({
        key: t.key,
        name: t.name,
        sub: t.sub,
        dur: t.dur,
        groupPrices: t.groupPrices ?? null,
        price: t.price,
        offer: t.offer && t.price && t.offer < t.price ? t.offer : null,
        onreq: !!t.onreq,
        img: absolute(req, t.img),
        stops: (t.stops ?? []).map(([time, place, desc]) => ({ time, place, desc })),
      }));

  return NextResponse.json(
    { tours, count: tours.length, currency: "MXN", pricingModel: "group-total" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

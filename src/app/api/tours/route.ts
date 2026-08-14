import { NextResponse } from "next/server";
import { getSavedTours } from "@/lib/content/tours";
import { getSavedAddons } from "@/lib/content/addons";
import { TOURS, parseTierPrices } from "@/app/(public)/[locale]/tours/data";
import { ACTIVITIES } from "@/app/(public)/[locale]/packages/data";
import { PARKS } from "@/app/(public)/[locale]/parks/data";

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

  // Activities & park tickets ("Add Experiences" catalog): the admin-saved
  // list wins (emoji/tiers carried over from the built-in by id); price null
  // or a not-directly-bookable entry = on request.
  const savedAddons = await getSavedAddons();
  const addons = savedAddons
    ? savedAddons.map((a) => {
        const base = ACTIVITIES.find((b) => b.id === a.id);
        return {
          id: a.id,
          name: a.name,
          emoji: base?.emoji ?? "🎟️",
          priceMXN: a.onRequest ? null : (a.offer && a.offer < a.price ? a.offer : a.price) || null,
          unit: a.unit || "/person",
          groupPrices: base?.groupPrices ?? null,
          onRequest: a.onRequest || !a.price,
        };
      })
    : ACTIVITIES.map((a) => ({
        id: a.id,
        name: a.name,
        emoji: a.emoji,
        priceMXN: a.price,
        unit: a.unit || "/person",
        groupPrices: a.groupPrices ?? null,
        onRequest: a.price == null || !a.inCart,
      }));

  // Parks catalogue — id-matched to the add-on list; the admin's saved
  // add-on price by id is live, the rate-card price is the fallback.
  const parks = PARKS.map((p) => {
    const live = savedAddons?.find((a) => a.id === p.id);
    const price = live
      ? (live.offer && live.offer < live.price ? live.offer : live.price) || p.price
      : p.price;
    return {
      id: p.id,
      name: p.name,
      sub: p.sub,
      dur: p.dur,
      priceMXN: price,
      img: absolute(req, p.img),
      desc: p.desc,
    };
  });

  return NextResponse.json(
    { tours, addons, parks, count: tours.length, currency: "MXN", pricingModel: "group-total" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

import { NextResponse } from "next/server";
import { getEffectiveDestinations } from "@/lib/content/activities";

export const dynamic = "force-dynamic";

/**
 * Public activities/destinations catalog — consumed by tutcasa.com's
 * Experiences page. Admin-saved activity list wins (same as our public
 * /activities page); images come back as absolute URLs.
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const abs = (u: string | undefined | null) =>
    !u ? null : /^https?:\/\//.test(u) ? u : `${origin}${u.startsWith("/") ? "" : "/"}${u}`;

  const all = await getEffectiveDestinations();
  const activities = all.map((d) => ({
    slug: d.slug,
    title: d.title,
    img: abs(d.card),
    blurb: (d.paragraphs?.[0] ?? "").slice(0, 220),
    url: `${origin}/en/destinations/${d.slug}?ref=tutcasa`,
  }));

  return NextResponse.json(
    { activities, count: activities.length },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

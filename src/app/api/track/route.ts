import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* Page-view beacon. The browser pings this once per page; we store only the
   page, the visitor's country (from the hosting platform's geo header) and the
   referrer — aggregate analytics, nothing personal. */

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview/i;

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });

    const body = (await request.json().catch(() => null)) as {
      path?: string;
      referrer?: string;
    } | null;
    const path = (body?.path ?? "/").slice(0, 200);
    // Never count the admin's own browsing.
    if (path.startsWith("/admin")) return NextResponse.json({ ok: true });

    const country = request.headers.get("x-vercel-ip-country") ?? null;
    let referrer = (body?.referrer ?? "").slice(0, 200) || null;
    // Only keep external referrers ("came from Google/Instagram/..."), not our own pages.
    if (referrer) {
      try {
        const host = new URL(referrer).hostname;
        if (host === request.nextUrl.hostname) referrer = null;
      } catch {
        referrer = null;
      }
    }

    const supabase = createAdminClient();
    await supabase.from("visits").insert({ path, country, referrer });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // analytics must never break the site
  }
}

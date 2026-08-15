import { NextResponse, type NextRequest } from "next/server";
import { syncStayRequests } from "@/lib/tutcasaBooking";

/* Polls TutCasa for every pending owner-approval stay request and acts on
   decisions (approved → payment link email; declined → guest informed).
   Triggered by the Vercel cron (vercel.json) and callable manually. Safe and
   idempotent — each request transitions at most once. Optional CRON_SECRET
   guard; without the env set, the route stays open but harmless (it leaks
   nothing and only does work that page loads do anyway). */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  await syncStayRequests();
  return NextResponse.json({ ok: true });
}

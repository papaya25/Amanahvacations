import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* Inbound from TutCasa: every TOUR booking made on their site lands here so
   the team sees it in the admin queue immediately (email + WhatsApp link
   remain the fallback channels). Auth: the shared partner key. */

export const dynamic = "force-dynamic";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function POST(request: NextRequest) {
  const key = process.env.TUTCASA_PARTNER_KEY;
  if (!key || request.headers.get("x-partner-key") !== key) {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }

  const bookingId = str(body.bookingId);
  const tourTitle = str(body.tourTitle);
  if (!bookingId || !tourTitle) {
    return NextResponse.json(
      { ok: false, error: "MISSING_FIELDS" },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tutcasa_tour_bookings").upsert(
    {
      booking_id: bookingId,
      ref: str(body.ref) ?? bookingId.slice(0, 8).toUpperCase(),
      tour_title: tourTitle,
      tour_date: str(body.tourDate),
      group_size: Number(body.groupSize) || null,
      total_label: str(body.totalLabel),
      guest_name: str(body.guestName),
      guest_email: str(body.guestEmail),
      guest_phone: str(body.guestPhone),
      notes: str(body.notes),
      status: str(body.status) ?? "new",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "booking_id" }
  );
  if (error) {
    console.error("tutcasa-tours upsert:", error.message);
    return NextResponse.json(
      { ok: false, error: "STORE_FAILED" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}

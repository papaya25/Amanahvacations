import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* Inbound from TutCasa: every airport-transfer job (create AND update/resend)
   lands here — upsert by transferId, so a resend after "need details" replaces
   the fields and puts the job back in the queue as `requested`. TutCasa also
   emails each job as a fallback; this endpoint feeds the admin workflow.
   Auth: the shared partner key, same as the booking API. */

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

  const transferId = str(body.transferId);
  const ref = str(body.ref);
  const fullName = str(body.fullName);
  if (!transferId || !ref || !fullName) {
    return NextResponse.json(
      { ok: false, error: "MISSING_FIELDS" },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tutcasa_transfers").upsert(
    {
      transfer_id: transferId,
      ref,
      full_name: fullName,
      travel_date: str(body.travelDate),
      flight_number: str(body.flightNumber),
      passengers: Number(body.passengers) || null,
      baby_seat: body.babySeat === true,
      note: str(body.note),
      kind: body.kind === "dropoff" ? "dropoff" : "pickup",
      // when TutCasa answers our question, keep the reply front and centre
      last_answer: str(body.lastAnswer),
      guest_phone: str(body.guestPhone),
      whatsapp: str(body.whatsapp),
      address: str(body.address),
      home: str(body.home),
      check_in: str(body.checkIn),
      // A resend replaces the job and reopens it in the queue.
      status: str(body.status) ?? "requested",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "transfer_id" }
  );
  if (error) {
    console.error("tutcasa-transfers upsert:", error.message);
    return NextResponse.json(
      { ok: false, error: "STORE_FAILED" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}

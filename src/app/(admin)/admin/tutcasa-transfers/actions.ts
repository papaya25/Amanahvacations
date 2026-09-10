"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { updateTutcasaTransferStatus } from "@/lib/tutcasa";

export type TransferJob = {
  transfer_id: string;
  ref: string;
  full_name: string;
  travel_date: string | null;
  flight_number: string | null;
  passengers: number | null;
  adults: number | null;
  kids: number | null;
  kids_ages: string | null;
  baby_seat: boolean;
  note: string | null;
  guest_phone: string | null;
  whatsapp: string | null;
  address: string | null;
  home: string | null;
  check_in: string | null;
  status: string;
  provider: string | null;
  price: number | null;
  amanah_note: string | null;
  kind: "pickup" | "dropoff" | null;
  last_answer: string | null;
  received_at: string;
  updated_at: string;
};

export async function listTransfers(): Promise<TransferJob[] | null> {
  if (!(await isAdminRequest())) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tutcasa_transfers")
    .select("*")
    .order("travel_date", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("listTransfers:", error.message);
    return null;
  }
  return (data ?? []) as TransferJob[];
}

/* Every action reports to TutCasa FIRST, then mirrors the result locally —
   TutCasa is the guest-facing source of truth for transfer status. A 404 on
   their side means the job vanished there: close it here. */

async function applyStatus(
  transferId: string,
  update: Parameters<typeof updateTutcasaTransferStatus>[1],
  localPatch: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  // Manually added transfers have no TutCasa counterpart — local only.
  const result = transferId.startsWith("manual-")
    ? "ok"
    : await updateTutcasaTransferStatus(transferId, update);
  if (result === "error") {
    return { ok: false, error: "TutCasa didn't accept the update — try again in a moment." };
  }
  const supabase = createAdminClient();
  await supabase
    .from("tutcasa_transfers")
    .update(
      result === "gone"
        ? { status: "closed", updated_at: new Date().toISOString() }
        : { ...localPatch, updated_at: new Date().toISOString() }
    )
    .eq("transfer_id", transferId);
  revalidatePath("/admin/tutcasa-transfers");
  if (result === "gone") {
    return { ok: false, error: "This transfer no longer exists on TutCasa — closed here." };
  }
  return { ok: true };
}

export async function confirmTransfer(transferId: string) {
  return applyStatus(transferId, { status: "confirmed" }, { status: "confirmed" });
}

export async function completeTransfer(transferId: string) {
  return applyStatus(transferId, { status: "done" }, { status: "done" });
}

/** Edit a transfer's details (works on TutCasa jobs too — local only; a
    TutCasa resend replaces the pushed fields but keeps provider/price). */
export async function updateTransfer(
  transferId: string,
  input: {
    fullName: string;
    travelDate: string;
    kind: "pickup" | "dropoff";
    flightNumber?: string;
    adults?: number;
    kids?: number;
    kidsAges?: string;
    babySeat?: boolean;
    guestPhone?: string;
    home?: string;
    note?: string;
    provider?: string;
    price?: number;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  if (!input.fullName?.trim() || !input.travelDate) {
    return { ok: false, error: "Name and travel date are required." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tutcasa_transfers")
    .update({
      full_name: input.fullName.trim(),
      travel_date: input.travelDate,
      kind: input.kind === "dropoff" ? "dropoff" : "pickup",
      flight_number: input.flightNumber?.trim() || null,
      adults: input.adults || null,
      kids: input.kids ?? null,
      kids_ages: input.kidsAges?.trim() || null,
      passengers: (input.adults || 0) + (input.kids || 0) || null,
      baby_seat: Boolean(input.babySeat),
      guest_phone: input.guestPhone?.trim() || null,
      home: input.home?.trim() || null,
      note: input.note?.trim() || null,
      provider: input.provider?.trim() || null,
      price: input.price || null,
      updated_at: new Date().toISOString(),
    })
    .eq("transfer_id", transferId);
  if (error) {
    console.error("updateTransfer:", error.message);
    return { ok: false, error: "Couldn't save. Please try again." };
  }
  revalidatePath("/admin/tutcasa-transfers");
  return { ok: true };
}

/** Assign/change who performs the ride (local field, no TutCasa callback). */
export async function setTransferProvider(transferId: string, provider: string) {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  const supabase = createAdminClient();
  await supabase
    .from("tutcasa_transfers")
    .update({ provider: provider.trim() || null, updated_at: new Date().toISOString() })
    .eq("transfer_id", transferId);
  revalidatePath("/admin/tutcasa-transfers");
  return { ok: true };
}

/** Manually add a transfer (phone/WhatsApp-arranged, or an Amanah booking).
    Created directly as "confirmed" — the admin adding it IS the acceptance —
    so it lands on the dashboard calendar and in the day-before reminders. */
export async function addManualTransfer(input: {
  fullName: string;
  travelDate: string;
  kind: "pickup" | "dropoff";
  flightNumber?: string;
  adults?: number;
  kids?: number;
  kidsAges?: string;
  babySeat?: boolean;
  guestPhone?: string;
  home?: string;
  note?: string;
  provider?: string;
  price?: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  if (!input.fullName?.trim() || !input.travelDate) {
    return { ok: false, error: "Name and travel date are required." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("tutcasa_transfers").insert({
    transfer_id: `manual-${Date.now()}`,
    ref: `MAN-${String(Date.now()).slice(-4)}`,
    full_name: input.fullName.trim(),
    travel_date: input.travelDate,
    kind: input.kind === "dropoff" ? "dropoff" : "pickup",
    flight_number: input.flightNumber?.trim() || null,
    adults: input.adults || null,
    kids: input.kids ?? null,
    kids_ages: input.kidsAges?.trim() || null,
    passengers: (input.adults || 0) + (input.kids || 0) || null,
    baby_seat: Boolean(input.babySeat),
    guest_phone: input.guestPhone?.trim() || null,
    home: input.home?.trim() || null,
    note: input.note?.trim() || null,
    provider: input.provider?.trim() || null,
    price: input.price || null,
    status: "confirmed",
  });
  if (error) {
    console.error("addManualTransfer:", error.message);
    return { ok: false, error: "Couldn't save the transfer. Please try again." };
  }
  revalidatePath("/admin/tutcasa-transfers");
  return { ok: true };
}

export async function requestTransferDetails(transferId: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "A note for the guest is required." };
  return applyStatus(
    transferId,
    { status: "need_details", note: trimmed },
    { status: "need_details", amanah_note: trimmed, last_answer: null }
  );
}

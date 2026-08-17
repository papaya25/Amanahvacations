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
  baby_seat: boolean;
  note: string | null;
  guest_phone: string | null;
  home: string | null;
  check_in: string | null;
  status: string;
  amanah_note: string | null;
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
  const result = await updateTutcasaTransferStatus(transferId, update);
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

export async function requestTransferDetails(transferId: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "A note for the guest is required." };
  return applyStatus(
    transferId,
    { status: "need_details", note: trimmed },
    { status: "need_details", amanah_note: trimmed }
  );
}

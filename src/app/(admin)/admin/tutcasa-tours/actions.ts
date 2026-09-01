"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { updateTutcasaTourStatus } from "@/lib/tutcasa";

export type TourBookingJob = {
  booking_id: string;
  ref: string;
  tour_title: string;
  tour_date: string | null;
  group_size: number | null;
  total_label: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  notes: string | null;
  last_answer: string | null;
  status: string;
  received_at: string;
};

export async function listTourBookings(): Promise<TourBookingJob[]> {
  if (!(await isAdminRequest())) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tutcasa_tour_bookings")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("listTourBookings:", error.message);
    return [];
  }
  return (data ?? []) as TourBookingJob[];
}

/* Every decision reports to TutCasa FIRST, then mirrors locally. */
async function decide(
  bookingId: string,
  action: "accept" | "deny" | "need_details",
  localStatus: string,
  note?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  const result = await updateTutcasaTourStatus(bookingId, action, note);
  if (result === "error") {
    return { ok: false, error: "TutCasa didn't accept the update — try again in a moment." };
  }
  const supabase = createAdminClient();
  await supabase
    .from("tutcasa_tour_bookings")
    .update(
      result === "gone"
        ? { status: "closed", updated_at: new Date().toISOString() }
        : {
            status: localStatus,
            ...(action === "need_details" ? { last_answer: null } : {}),
            updated_at: new Date().toISOString(),
          }
    )
    .eq("booking_id", bookingId);
  revalidatePath("/admin/tutcasa-tours");
  if (result === "gone") {
    return { ok: false, error: "This booking no longer exists on TutCasa — closed here." };
  }
  return { ok: true };
}

export async function acceptTourBooking(bookingId: string) {
  return decide(bookingId, "accept", "accepted");
}

export async function denyTourBooking(bookingId: string, note?: string) {
  return decide(bookingId, "deny", "denied", note);
}

export async function askTourDetails(bookingId: string, note: string) {
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "Write the question first." };
  return decide(bookingId, "need_details", "asked_details", trimmed);
}

export async function deleteTourBooking(bookingId: string) {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tutcasa_tour_bookings")
    .delete()
    .eq("booking_id", bookingId);
  revalidatePath("/admin/tutcasa-tours");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Remove a finished transfer job from the queue (local only). */
export async function deleteTransferJob(transferId: string) {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tutcasa_transfers")
    .delete()
    .eq("transfer_id", transferId);
  revalidatePath("/admin/tutcasa-transfers");
  return error ? { ok: false, error: error.message } : { ok: true };
}

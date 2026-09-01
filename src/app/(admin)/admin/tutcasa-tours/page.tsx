import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { PageHead } from "../AdminUI";

// The queue must always show the latest pushed bookings.
export const dynamic = "force-dynamic";

type TourBookingJob = {
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
  status: string;
  received_at: string;
};

async function listTourBookings(): Promise<TourBookingJob[]> {
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

const fmtDate = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function TutcasaToursPage() {
  const jobs = await listTourBookings();
  return (
    <>
      <PageHead
        eyebrow="Partner"
        title="TutCasa Tour Bookings"
        desc="Every tour booked on TutCasa lands here the moment it happens (plus the email + WhatsApp fallback). Contact the guest to schedule, then TutCasa marks it confirmed/paid on their side."
      />
      <div className="grid gap-3">
        {jobs.map((j) => (
          <div key={j.booking_id} className="rounded-xl border border-sand bg-cream/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-gray-500">{j.ref}</span>{" "}
                <span className="font-serif text-[18px] font-semibold text-ink">{j.tour_title}</span>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                {j.status}
              </span>
            </div>
            <div className="mt-1 grid gap-0.5 text-sm text-gray-700 sm:grid-cols-2">
              <div>📅 {fmtDate(j.tour_date)} · {j.group_size ?? "?"} people · <b>{j.total_label ?? "—"}</b></div>
              <div>👤 {j.guest_name ?? "—"} · {j.guest_email ?? ""}{j.guest_phone ? ` · ${j.guest_phone}` : ""}</div>
              {j.notes && <div className="sm:col-span-2">📝 {j.notes}</div>}
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="rounded-xl border border-sand bg-cream/40 p-8 text-center text-gray-500">
            No TutCasa tour bookings yet — they appear here the moment a guest books.
          </div>
        )}
      </div>
    </>
  );
}

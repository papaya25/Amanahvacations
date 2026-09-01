"use client";

/* TutCasa tour-booking queue: Accept (we can operate it), Deny, or Ask
   for details — every decision reports to TutCasa first and shows up in
   their admin instantly. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptTourBooking,
  denyTourBooking,
  askTourDetails,
  deleteTourBooking,
  type TourBookingJob,
} from "./actions";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  denied: "bg-red-100 text-red-700",
  asked_details: "bg-orange-100 text-orange-800",
  answered: "bg-sky-100 text-sky-800",
  closed: "bg-gray-200 text-gray-500",
};

const fmtDate = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";

function JobCard({ job }: { job: TourBookingJob }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await fn();
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else setNoteOpen(false);
    router.refresh();
  };

  const open = job.status === "new" || job.status === "asked_details" || job.status === "answered";

  return (
    <div className="rounded-xl border border-sand bg-cream/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-bold text-gray-500">{job.ref}</span>{" "}
          <span className="font-serif text-[18px] font-semibold text-ink">{job.tour_title}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[job.status] ?? "bg-gray-100 text-gray-600"}`}>
          {job.status.replace("_", " ")}
        </span>
      </div>
      <div className="mt-1 grid gap-0.5 text-sm text-gray-700 sm:grid-cols-2">
        <div>📅 {fmtDate(job.tour_date)} · {job.group_size ?? "?"} people · <b>{job.total_label ?? "—"}</b></div>
        <div>👤 {job.guest_name ?? "—"} · {job.guest_email ?? ""}{job.guest_phone ? ` · ${job.guest_phone}` : ""}</div>
        {job.notes && <div className="sm:col-span-2">📝 {job.notes}</div>}
        {job.last_answer && (
          <div className="sm:col-span-2 font-semibold text-emerald-800">✅ TutCasa answered: “{job.last_answer}”</div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {open && (
          <>
            <button disabled={busy} onClick={() => run(() => acceptTourBooking(job.booking_id))}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              ✓ Accept
            </button>
            <button disabled={busy} onClick={() => { if (confirm("Deny this tour booking? TutCasa will mark it cancelled.")) run(() => denyTourBooking(job.booking_id)); }}
              className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-bold text-red-700 disabled:opacity-50">
              ✕ Deny
            </button>
            <button disabled={busy} onClick={() => setNoteOpen((v) => !v)}
              className="rounded-full border border-amber-400 px-4 py-1.5 text-xs font-bold text-amber-800 disabled:opacity-50">
              {noteOpen ? "Close" : "? Ask for details"}
            </button>
          </>
        )}
        <button disabled={busy} onClick={() => { if (confirm("Delete this booking from the queue? (Removes it here only.)")) run(() => deleteTourBooking(job.booking_id)); }}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-bold text-gray-500 disabled:opacity-50">
          🗑 Delete
        </button>
      </div>
      {noteOpen && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="What do you need to know? (shows on TutCasa's admin)"
            className="min-w-[240px] flex-1 rounded-lg border border-sand bg-white px-3 py-2 text-sm" />
          <button disabled={busy || !note.trim()} onClick={() => run(() => askTourDetails(job.booking_id, note))}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            Send question
          </button>
        </div>
      )}
      {error && <div className="mt-2 text-sm font-semibold text-red-700">{error}</div>}
    </div>
  );
}

export default function ToursQueueClient({ initialJobs }: { initialJobs: TourBookingJob[] }) {
  return (
    <div className="grid gap-3">
      {initialJobs.map((j) => <JobCard key={j.booking_id} job={j} />)}
      {initialJobs.length === 0 && (
        <div className="rounded-xl border border-sand bg-cream/40 p-8 text-center text-gray-500">
          No TutCasa tour bookings yet — they appear here the moment a guest books.
        </div>
      )}
    </div>
  );
}

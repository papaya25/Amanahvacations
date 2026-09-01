"use client";

/* The transfers work-queue. Active jobs first (soonest travel date on top —
   that's the pickup order), finished ones collapsed below. Every action
   reports to TutCasa first; the local card mirrors the outcome. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../AdminUI";
import {
  confirmTransfer,
  completeTransfer,
  requestTransferDetails,
  type TransferJob,
} from "./actions";
import { deleteTransferJob } from "../tutcasa-tours/actions";

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  need_details: "bg-orange-100 text-orange-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  done: "bg-gray-200 text-gray-600",
  closed: "bg-gray-200 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  need_details: "Waiting on guest details",
  confirmed: "Confirmed",
  done: "Done",
  closed: "Closed (gone on TutCasa)",
};

const fmtDate = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";

function JobCard({ job }: { job: TransferJob }) {
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

  const active = job.status === "requested" || job.status === "need_details" || job.status === "confirmed";

  return (
    <div className="rounded-xl border border-sand bg-cream/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-[19px] font-semibold text-ink">{job.full_name}</span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
            {job.kind === "dropoff" ? "🛫 Drop-off" : "🛬 Pickup"}
          </span>
          <span className="rounded-full border border-sand bg-white px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-forest">
            {job.ref}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${STATUS_STYLE[job.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABEL[job.status] ?? job.status}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-ink">{fmtDate(job.travel_date)}</div>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] text-ink/85 sm:grid-cols-2 lg:grid-cols-3">
        <div>✈️ Flight: <strong>{job.flight_number ?? "—"}</strong></div>
        <div>👥 Passengers: <strong>{job.passengers ?? "—"}</strong>{job.baby_seat && <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[10.5px] font-bold text-forest">BABY SEAT</span>}</div>
        <div>🏡 Drop-off: <strong>{job.home ?? "—"}</strong></div>
        <div>
          📞 Guest:{" "}
          {job.guest_phone ? (
            <a
              className="font-semibold text-forest underline underline-offset-2"
              href={`https://wa.me/${job.guest_phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {job.guest_phone}
            </a>
          ) : (
            "—"
          )}
        </div>
        {job.address && <div className="sm:col-span-2">📍 Address & unit: {job.address}</div>}
        {job.whatsapp && <div>💬 WhatsApp: {job.whatsapp}</div>}
        {job.note && <div className="sm:col-span-2">📝 Note: {job.note}</div>}
        {job.amanah_note && (
          <div className="sm:col-span-2 text-orange-800">↳ We asked: “{job.amanah_note}”</div>
        )}
        {job.last_answer && (
          <div className="sm:col-span-2 font-semibold text-emerald-800">✅ TutCasa answered: “{job.last_answer}”</div>
        )}
      </div>

      {active && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {job.status !== "confirmed" && (
            <button
              onClick={() => run(() => confirmTransfer(job.transfer_id))}
              disabled={busy}
              className="rounded-full bg-forest px-4 py-2 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              ✓ Confirm
            </button>
          )}
          {job.status === "confirmed" && (
            <button
              onClick={() => run(() => completeTransfer(job.transfer_id))}
              disabled={busy}
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-4 py-2 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Done (picked up)
            </button>
          )}
          <button
            onClick={() => setNoteOpen((o) => !o)}
            disabled={busy}
            className="rounded-full border-[1.5px] border-sand bg-white px-4 py-2 text-[12.5px] font-semibold text-ink transition hover:border-forest disabled:opacity-40"
          >
            Need more details…
          </button>
</div>
      )}

      <div className="mt-2">
        <button disabled={busy} onClick={() => { if (confirm("Delete this transfer from the queue? (Removes it here only.)")) run(() => deleteTransferJob(job.transfer_id)); }}
          className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-semibold text-gray-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-40">
          🗑 Delete from queue
        </button>
      </div>

      {noteOpen && active && (
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's missing? e.g. Which terminal / arrival time? (the guest sees this)"
            className="w-full rounded-xl border-[1.5px] border-sand bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-forest"
          />
          <button
            onClick={() => run(() => requestTransferDetails(job.transfer_id, note))}
            disabled={busy || !note.trim()}
            className="shrink-0 rounded-xl border-[1.5px] border-forest px-4 text-[12.5px] font-semibold text-forest transition hover:bg-forest hover:text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-[12.5px] font-medium text-terracotta">{error}</p>}
    </div>
  );
}

export default function TransfersClient({ initialJobs }: { initialJobs: TransferJob[] }) {
  const active = initialJobs.filter((j) => j.status !== "done" && j.status !== "closed");
  const finished = initialJobs.filter((j) => j.status === "done" || j.status === "closed");

  return (
    <>
      <Card>
        {active.length === 0 ? (
          <p className="text-[13.5px] italic text-sage">
            No open transfer jobs — new TutCasa bookings will appear here automatically.
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((j) => (
              <JobCard key={j.transfer_id} job={j} />
            ))}
          </div>
        )}
      </Card>

      {finished.length > 0 && (
        <Card>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-sage">
            Completed ({finished.length})
          </p>
          <div className="space-y-3 opacity-70">
            {finished.map((j) => (
              <JobCard key={j.transfer_id} job={j} />
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

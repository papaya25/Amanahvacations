"use client";

/* The transfers work-queue. Active jobs first (soonest travel date on top —
   that's the pickup order), finished ones collapsed below. Every action
   reports to TutCasa first; the local card mirrors the outcome. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../AdminUI";
import {
  addManualTransfer,
  confirmTransfer,
  completeTransfer,
  requestTransferDetails,
  setTransferProvider,
  updateTransfer,
  type TransferJob,
} from "./actions";
import { deleteTransferJob } from "../tutcasa-tours/actions";

/* One form, two jobs: "add manually" (blank) and per-card "Edit" (prefilled). */
export type TransferFields = {
  fullName: string; travelDate: string; kind: "pickup" | "dropoff";
  flightNumber: string; adults: number; kids: number; kidsAges: string[]; babySeat: boolean;
  guestPhone: string; home: string; note: string; provider: string; price: number;
};

const BLANK: TransferFields = {
  fullName: "", travelDate: "", kind: "pickup", flightNumber: "", adults: 2, kids: 0, kidsAges: [],
  babySeat: false, guestPhone: "", home: "", note: "", provider: "", price: 0,
};

function TransferForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: TransferFields;
  submitLabel: string;
  onSubmit: (f: TransferFields) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState(initial);
  const set = (k: string, v: string | number | boolean) => setF((p) => ({ ...p, [k]: v }));
  const inputCls = "w-full rounded-xl border-[1.5px] border-sand bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-forest";
  const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest";

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await onSubmit({ ...f, kidsAges: f.kidsAges.slice(0, f.kids).map((a) => a.trim()).filter(Boolean) });
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
  };

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div><span className={labelCls}>Guest name *</span><input className={inputCls} value={f.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
      <div><span className={labelCls}>Travel date *</span><input type="date" className={inputCls} value={f.travelDate} onChange={(e) => set("travelDate", e.target.value)} /></div>
      <div>
        <span className={labelCls}>Direction</span>
        <select className={inputCls} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
          <option value="pickup">🛬 Pickup (airport → hotel)</option>
          <option value="dropoff">🛫 Drop-off (hotel → airport)</option>
        </select>
      </div>
      <div><span className={labelCls}>Flight</span><input className={inputCls} value={f.flightNumber} onChange={(e) => set("flightNumber", e.target.value)} placeholder="AM 512" /></div>
      <div><span className={labelCls}>Adults</span><input type="number" min={1} className={inputCls} value={f.adults === 0 ? "" : f.adults} onChange={(e) => set("adults", Number(e.target.value) || 0)} /></div>
      <div><span className={labelCls}>Kids / babies</span><input type="number" min={0} className={inputCls} value={f.kids === 0 ? "" : f.kids} onChange={(e) => set("kids", Number(e.target.value) || 0)} placeholder="0" /></div>
      {f.kids > 0 && (
        <div className="sm:col-span-2">
          <span className={labelCls}>Age of each kid / baby</span>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: f.kids }).map((_, i) => (
              <input
                key={i}
                className={inputCls + " !w-28"}
                value={f.kidsAges[i] ?? ""}
                onChange={(e) => {
                  const ages = [...f.kidsAges];
                  ages[i] = e.target.value;
                  setF((p) => ({ ...p, kidsAges: ages.slice(0, f.kids) }));
                }}
                placeholder={`Kid ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      <div><span className={labelCls}>Guest phone</span><input className={inputCls} value={f.guestPhone} onChange={(e) => set("guestPhone", e.target.value)} placeholder="+1 ..." /></div>
      <div><span className={labelCls}>Provider</span><input className={inputCls} value={f.provider} onChange={(e) => set("provider", e.target.value)} placeholder="Driver / company" /></div>
      <div><span className={labelCls}>Price</span><input type="number" min={0} className={inputCls} value={f.price === 0 ? "" : f.price} onChange={(e) => set("price", Number(e.target.value) || 0)} placeholder="MXN" /></div>
      <div className="lg:col-span-2"><span className={labelCls}>Drop-off / pickup place</span><input className={inputCls} value={f.home} onChange={(e) => set("home", e.target.value)} placeholder="Hotel or villa name & area" /></div>
      <div><span className={labelCls}>Note</span><input className={inputCls} value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Baby seat brand, luggage, terminal…" /></div>
      <div className="flex items-end gap-3">
        <label className="flex h-[42px] items-center gap-2 text-[12.5px] text-ink">
          <input type="checkbox" checked={f.babySeat} onChange={(e) => set("babySeat", e.target.checked)} className="h-4 w-4 accent-forest" />
          Baby seat
        </label>
        <button
          onClick={submit}
          disabled={busy || !f.fullName.trim() || !f.travelDate}
          className="h-[42px] rounded-full bg-forest px-5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
      {error && <p className="text-[12.5px] font-medium text-terracotta lg:col-span-4">{error}</p>}
    </div>
  );
}

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
  const [providerEdit, setProviderEdit] = useState(false);
  const [provider, setProvider] = useState(job.provider ?? "");
  const [editOpen, setEditOpen] = useState(false);

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
  // Manual transfers have no TutCasa side: only Done + delete apply.
  const isManual = job.transfer_id.startsWith("manual-");

  return (
    <div className="rounded-xl border border-sand bg-cream/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-[19px] font-semibold text-ink">{job.full_name}</span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
            {job.kind === "dropoff" ? "🛫 Drop-off" : "🛬 Pickup"}
          </span>
          {isManual && (
            <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-bold text-forest">✍️ Manual</span>
          )}
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
        <div>👥 Passengers:{" "}
          <strong>
            {job.adults != null || job.kids != null
              ? `${job.adults ?? 0} adult${(job.adults ?? 0) !== 1 ? "s" : ""}${job.kids ? ` + ${job.kids} kid${job.kids !== 1 ? "s" : ""}` : ""}`
              : job.passengers ?? "—"}
          </strong>
          {job.kids_ages && <span className="text-sage"> (ages: {job.kids_ages})</span>}{job.baby_seat && <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[10.5px] font-bold text-forest">BABY SEAT</span>}</div>
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
        <div>
          🚐 Provider:{" "}
          {providerEdit ? (
            <span className="inline-flex items-center gap-1.5">
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Driver / company"
                className="w-40 rounded-lg border-[1.5px] border-sand bg-white px-2 py-1 text-[12.5px] outline-none focus:border-forest"
                autoFocus
              />
              <button
                onClick={() => run(async () => { const r = await setTransferProvider(job.transfer_id, provider); if (r.ok) setProviderEdit(false); return r; })}
                disabled={busy}
                className="rounded-lg border-[1.5px] border-forest px-2 py-1 text-[12px] font-semibold text-forest hover:bg-forest hover:text-white disabled:opacity-40"
              >
                ✓
              </button>
            </span>
          ) : (
            <button
              onClick={() => setProviderEdit(true)}
              className={`underline decoration-dotted underline-offset-2 ${job.provider ? "font-semibold text-ink" : "text-sage"}`}
              title="Click to change"
            >
              {job.provider ?? "assign…"}
            </button>
          )}
        </div>
        {job.price != null && job.price > 0 && (
          <div>💰 Price: <strong>${Math.round(job.price).toLocaleString("en-US")} MXN</strong></div>
        )}
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
          {job.status !== "confirmed" && !isManual && (
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
          {!isManual && (
            <button
              onClick={() => setNoteOpen((o) => !o)}
              disabled={busy}
              className="rounded-full border-[1.5px] border-sand bg-white px-4 py-2 text-[12.5px] font-semibold text-ink transition hover:border-forest disabled:opacity-40"
            >
              Need more details…
            </button>
          )}
</div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() => setEditOpen((o) => !o)}
          className="rounded-full border border-sand bg-white px-3 py-1 text-[12px] font-semibold text-forest transition hover:border-forest disabled:opacity-40"
        >
          ✏️ {editOpen ? "Close edit" : "Edit"}
        </button>
        <button disabled={busy} onClick={() => { if (confirm("Delete this transfer from the queue? (Removes it here only.)")) run(() => deleteTransferJob(job.transfer_id)); }}
          className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-semibold text-gray-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-40">
          🗑 Delete from queue
        </button>
      </div>

      {editOpen && (
        <TransferForm
          initial={{
            fullName: job.full_name,
            travelDate: job.travel_date ?? "",
            kind: job.kind === "dropoff" ? "dropoff" : "pickup",
            flightNumber: job.flight_number ?? "",
            adults: job.adults ?? job.passengers ?? 2,
            kids: job.kids ?? 0,
            kidsAges: (job.kids_ages ?? "").split(",").map((a) => a.trim()).filter(Boolean),
            babySeat: job.baby_seat,
            guestPhone: job.guest_phone ?? "",
            home: job.home ?? "",
            note: job.note ?? "",
            provider: job.provider ?? "",
            price: job.price ?? 0,
          }}
          submitLabel="Save changes"
          onSubmit={async (f) => {
            const res = await updateTransfer(job.transfer_id, { ...f, kidsAges: f.kidsAges.join(", ") });
            if (res.ok) {
              setEditOpen(false);
              router.refresh();
            }
            return res;
          }}
        />
      )}

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

function ManualAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
      >
        {open ? "− Close" : "+ Add a transfer manually"}
      </button>
      {open && (
        <TransferForm
          initial={BLANK}
          submitLabel="Add transfer"
          onSubmit={async (f) => {
            const res = await addManualTransfer({ ...f, kidsAges: f.kidsAges.join(", ") });
            if (res.ok) {
              setOpen(false);
              router.refresh();
            }
            return res;
          }}
        />
      )}
    </Card>
  );
}

export default function TransfersClient({ initialJobs }: { initialJobs: TransferJob[] }) {
  const active = initialJobs.filter((j) => j.status !== "done" && j.status !== "closed");
  const finished = initialJobs.filter((j) => j.status === "done" || j.status === "closed");

  return (
    <>
      <ManualAddForm />
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

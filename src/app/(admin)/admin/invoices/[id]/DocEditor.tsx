"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceSheet from "@/components/InvoiceSheet";
import { STATUSES, folioLabel, type Day, type DocData, type DocRow, type Pair } from "@/lib/invoiceDoc";
import { quoteToInvoice, saveDocument } from "../actions";

const inputCls = "w-full rounded-xl border-[1.5px] border-sand bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-forest";
const labelCls = "mb-1 block text-[10.5px] font-semibold uppercase tracking-[1.2px] text-forest";
const btn = "rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink disabled:opacity-50";
const btnGhost = "rounded-full border border-sand bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-forest disabled:opacity-50";
const small = "text-[12px] font-semibold text-forest hover:underline";

function Section({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="rounded-[16px] border border-sand bg-white">
      <summary className="cursor-pointer select-none px-4 py-3 font-serif text-[18px] font-semibold text-ink">{title}</summary>
      <div className="space-y-3 border-t border-sand/60 px-4 py-4">{children}</div>
    </details>
  );
}

function Text({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {area ? (
        <textarea rows={3} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** Label / value lines: add, change or remove any of them. */
function Pairs({ rows, onChange, labelHint = "Label", valueHint = "Value" }: { rows: Pair[]; onChange: (r: Pair[]) => void; labelHint?: string; valueHint?: string }) {
  const set = (i: number, k: keyof Pair, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input className={`${inputCls} w-[40%]`} placeholder={labelHint} value={r.label} onChange={(e) => set(i, "label", e.target.value)} />
          <input className={inputCls} placeholder={valueHint} value={r.value} onChange={(e) => set(i, "value", e.target.value)} />
          <button aria-label="Remove line" className="px-1 text-[16px] text-sage hover:text-terracotta" onClick={() => onChange(rows.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button className={small} onClick={() => onChange([...rows, { label: "", value: "" }])}>+ Add line</button>
    </div>
  );
}

export default function DocEditor({ doc }: { doc: DocRow }) {
  const router = useRouter();
  const [d, setD] = useState<DocData>(doc.data);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = <K extends keyof DocData>(k: K, v: DocData[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setDirty(true);
    setMsg("");
  };
  const invoice = doc.kind === "invoice";
  const name = invoice ? `Invoice ${folioLabel(doc.folio)}` : "Quote";

  const save = async () => {
    setBusy(true);
    const res = await saveDocument(doc.id, d);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error ?? "Couldn't save.");
      return false;
    }
    setDirty(false);
    setMsg("Saved ✓");
    return true;
  };
  const pdf = async () => {
    const w = window.open("about:blank", "_blank"); // opened now so the browser doesn't block it
    if (!dirty || (await save())) {
      if (w) w.location.href = `/admin-print/${doc.id}`;
    } else w?.close();
  };
  const toInvoice = async () => {
    if (dirty && !(await save())) return;
    setBusy(true);
    const res = await quoteToInvoice(doc.id);
    setBusy(false);
    if (res.ok && res.id) router.push(`/admin/invoices/${res.id}`);
    else setMsg(res.error ?? "Couldn't convert.");
  };
  const setDay = (i: number, k: keyof Day, v: string) => set("schedule", d.schedule.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  return (
    <>
      <div className="sticky top-[57px] z-10 -mx-5 mb-5 flex flex-wrap items-center gap-2 border-b border-sand bg-cream/95 px-5 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <Link href="/admin/invoices" className="text-[13px] font-semibold text-sage hover:text-forest">← All invoices &amp; quotes</Link>
        <h1 className="ml-2 font-serif text-[22px] font-semibold text-ink">{name}{d.client ? ` · ${d.client}` : ""}</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className={`text-[12px] ${dirty ? "text-terracotta" : "text-sage"}`}>{dirty ? "Unsaved changes" : msg}</span>
          <button className={btn} disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : "Save"}</button>
          <button className={btnGhost} disabled={busy} onClick={pdf}>Download PDF</button>
          {!invoice && <button className={btnGhost} disabled={busy} onClick={toInvoice}>Turn into invoice</button>}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_540px]">
        <div className="space-y-3">
          <Section title="Client & greeting">
            <div className="grid gap-3 sm:grid-cols-2">
              <Text label="Client name(s)" value={d.client} onChange={(v) => set("client", v)} />
              <label className="block">
                <span className={labelCls}>{invoice ? "Issued" : "Prepared"}</span>
                <input type="date" className={inputCls} value={d.issued} onChange={(e) => set("issued", e.target.value)} />
              </label>
            </div>
            <Text label="Greeting (italic line)" value={d.greeting} onChange={(v) => set("greeting", v)} />
          </Section>

          <Section title="Green ticket">
            <div className="grid gap-3 sm:grid-cols-2">
              <Text label="Small gold line" value={d.eyebrow} onChange={(v) => set("eyebrow", v)} />
              <Text label="Service / trip name" value={d.service} onChange={(v) => set("service", v)} />
            </div>
            <Text label="Line under the name" value={d.sub} onChange={(v) => set("sub", v)} />
            <div>
              <span className={labelCls}>Route (dots) — e.g. Pick-up · Stop 1 · Return</span>
              <Pairs rows={d.route} onChange={(r) => set("route", r)} labelHint="Pick-up / Stop 1" valueHint="Place" />
            </div>
            <div>
              <span className={labelCls}>Bottom facts — e.g. Date · Pick-up · Guests</span>
              <Pairs rows={d.facts} onChange={(r) => set("facts", r)} labelHint="Date" valueHint="Thu, Nov 19, 2026" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Text label="Gold stub — small word" value={d.stubLabel} onChange={(v) => set("stubLabel", v)} />
              <Text label={invoice ? "Gold stub — big text (empty = folio)" : "Gold stub — big text (e.g. JAN 4–9)"} value={d.stubText} onChange={(v) => set("stubText", v)} />
            </div>
          </Section>

          <Section title={`Day-by-day schedule${d.schedule.length ? ` (${d.schedule.length})` : ""}`} open={!invoice}>
            {d.schedule.map((s, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-sand/70 bg-cream/50 p-3">
                <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_auto]">
                  <input type="date" className={inputCls} value={s.date} onChange={(e) => setDay(i, "date", e.target.value)} />
                  <input className={inputCls} placeholder="Title — e.g. Tulum, Akumal & Cenote Dos Ojos" value={s.title} onChange={(e) => setDay(i, "title", e.target.value)} />
                  <button className="px-1 text-[12px] text-sage hover:text-terracotta" onClick={() => set("schedule", d.schedule.filter((_, j) => j !== i))}>Remove</button>
                </div>
                <textarea rows={2} className={inputCls} placeholder="What happens that day" value={s.desc} onChange={(e) => setDay(i, "desc", e.target.value)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Right label — e.g. Duration" value={s.durLabel} onChange={(e) => setDay(i, "durLabel", e.target.value)} />
                  <input className={inputCls} placeholder="e.g. 5–6 hours" value={s.dur} onChange={(e) => setDay(i, "dur", e.target.value)} />
                </div>
              </div>
            ))}
            <button
              className={small}
              onClick={() => {
                const last = d.schedule[d.schedule.length - 1]?.date;
                const next = last ? new Date(new Date(`${last}T12:00:00`).getTime() + 864e5).toISOString().slice(0, 10) : "";
                set("schedule", [...d.schedule, { date: next, title: "", desc: "", durLabel: "Duration", dur: "" }]);
              }}
            >
              + Add a day
            </button>
          </Section>

          <Section title="Guests">
            <Pairs rows={d.guests} onChange={(r) => set("guests", r)} />
          </Section>

          <Section title="Pick-up">
            <Text label="Section title (e.g. Pick-up or Arrival)" value={d.pickupTitle} onChange={(v) => set("pickupTitle", v)} />
            <Pairs rows={d.pickup} onChange={(r) => set("pickup", r)} />
          </Section>

          <Section title={invoice ? "Payment" : "Price"}>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className={labelCls}>Total MXN (0 = FREE)</span>
                <input type="number" min={0} className={inputCls} value={d.totalMXN || ""} onChange={(e) => set("totalMXN", Number(e.target.value) || 0)} />
              </label>
              <label className="block">
                <span className={labelCls}>Total USD (empty = hidden)</span>
                <input type="number" min={0} className={inputCls} value={d.totalUSD || ""} onChange={(e) => set("totalUSD", Number(e.target.value) || 0)} />
              </label>
              <label className="block">
                <span className={labelCls}>Status</span>
                <select className={inputCls} value={d.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s || "Don't show"}</option>)}
                </select>
              </label>
            </div>
            <div>
              <span className={labelCls}>Lines — e.g. Per person · Method · Toddler</span>
              <Pairs rows={d.payment} onChange={(r) => set("payment", r)} labelHint="Per person" valueHint="215 USD (3,870 MXN) × 2 adults" />
            </div>
          </Section>

          <Section title="Your reservation">
            <Pairs rows={d.reservation} onChange={(r) => set("reservation", r)} />
          </Section>

          <Section title="Notes box">
            <label className="block">
              <span className={labelCls}>One note per line</span>
              <textarea rows={4} className={inputCls} value={d.notes.join("\n")} onChange={(e) => set("notes", e.target.value.split("\n"))} />
            </label>
          </Section>
        </div>

        <div className="xl:sticky xl:top-[130px]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-sage">Live preview</p>
          <div className="overflow-hidden rounded-[6px]">
            <InvoiceSheet kind={doc.kind} folio={doc.folio} d={d} zoom={0.66} />
          </div>
        </div>
      </div>
    </>
  );
}

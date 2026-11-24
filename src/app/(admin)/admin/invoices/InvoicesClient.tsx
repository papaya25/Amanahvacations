"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { folioLabel, longDate, type DocKind, type DocRow } from "@/lib/invoiceDoc";
import { createDocument, deleteDocument, quoteToInvoice } from "./actions";

const btn = "rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink disabled:opacity-50";
const link = "text-[12.5px] font-semibold text-forest hover:underline disabled:opacity-50";
const th = "border-b border-sand px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[1.2px] text-sage";
const td = "border-b border-sand/60 px-3 py-2.5 text-[13px] text-ink";

export default function InvoicesClient({ docs }: { docs: DocRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState<"all" | DocKind>("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");

  const go = async (fn: () => Promise<{ ok: boolean; error?: string; id?: string }>, open = true) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await fn();
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "Something went wrong.");
    if (open && res.id) router.push(`/admin/invoices/${res.id}`);
    else router.refresh();
  };

  const statuses = [...new Set(docs.map((d) => d.data.status).filter(Boolean))].sort();
  const months = [...new Set(docs.map((d) => d.data.issued?.slice(0, 7)).filter(Boolean))].sort().reverse();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const list = docs.filter((d) => {
    if (show !== "all" && d.kind !== show) return false;
    if (status && d.data.status !== status) return false;
    if (month && !d.data.issued?.startsWith(month)) return false;
    const hay = [folioLabel(d.folio), d.data.client, d.data.service, d.data.sub, d.data.eyebrow, String(d.data.totalMXN || "")].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const pill = "rounded-full border border-sand bg-white px-4 py-2 text-[13px] text-ink outline-none focus:border-forest";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button className={btn} disabled={busy} onClick={() => go(() => createDocument("invoice"))}>+ New invoice</button>
        <button className={btn} disabled={busy} onClick={() => go(() => createDocument("quote"))}>+ New quote</button>
        {error && <span className="w-full text-[12.5px] font-medium text-terracotta">{error}</span>}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client, service, folio (AV 454)…" aria-label="Search invoices and quotes" className={`${pill} min-w-[240px] flex-1`} />
        <select value={show} onChange={(e) => setShow(e.target.value as typeof show)} className={pill} aria-label="Type">
          <option value="all">Invoices &amp; quotes</option>
          <option value="invoice">Invoices only</option>
          <option value="quote">Quotes only</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={pill} aria-label="Status">
          <option value="">Any status</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className={pill} aria-label="Month issued">
          <option value="">Any month</option>
          {months.map((m) => <option key={m} value={m}>{new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>)}
        </select>
        {(q || show !== "all" || status || month) && (
          <button className={link} onClick={() => { setQ(""); setShow("all"); setStatus(""); setMonth(""); }}>Clear</button>
        )}
        <span className="text-[12px] text-sage">{list.length} of {docs.length}</span>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-sand bg-white">
        {list.length === 0 ? (
          <p className="p-6 text-[13px] italic text-sage">{docs.length ? "Nothing matches these filters." : <>Nothing yet. Make one here, or click “Make confirmation” on a booking in Orders &amp; Bookings.</>}</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>{["", "Folio", "Client", "Service", "Issued", "Total", "Status", ""].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td className={td}>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase ${d.kind === "invoice" ? "bg-forest/10 text-forest" : "bg-gold/20 text-ink"}`}>{d.kind}</span>
                  </td>
                  <td className={`${td} font-semibold`}>{folioLabel(d.folio) || "—"}</td>
                  <td className={`${td} font-medium`}>{d.data.client || "—"}</td>
                  <td className={td}>{d.data.service || "—"}</td>
                  <td className={`${td} text-sage`}>{longDate(d.data.issued)}</td>
                  <td className={td}>{d.data.totalMXN > 0 ? `$${d.data.totalMXN.toLocaleString("en-US")} MXN` : "—"}</td>
                  <td className={td}>{d.data.status || "—"}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <a className={`${link} mr-3`} href={`/admin/invoices/${d.id}`}>Edit</a>
                    <a className={`${link} mr-3`} href={`/admin-print/${d.id}`} target="_blank" rel="noreferrer">PDF</a>
                    {d.kind === "quote" && (
                      <button className={`${link} mr-3`} disabled={busy} onClick={() => go(() => quoteToInvoice(d.id))}>Turn into invoice</button>
                    )}
                    <button className="text-[12.5px] text-sage hover:text-terracotta" disabled={busy} onClick={() => confirm(`Delete this ${d.kind}?`) && go(() => deleteDocument(d.id), false)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

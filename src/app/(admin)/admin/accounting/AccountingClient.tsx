"use client";

/* The accounting book. Rows arrive fully computed from the server; this
   component only slices them (by month / year / partner), shows the math and
   sends edits back. Every number is MXN. */

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PAYMENT_METHODS,
  SERVICE_TYPES,
  SOURCES,
  buildBalances,
  periodStatement,
  type BalanceLine,
  matchPartner,
  rowMath,
  type AcctRow,
  type Book,
  type LedgerEntry,
  type Partner,
  type Payment,
  type ServiceType,
} from "@/lib/accounting";
import { bookAdd, bookDelete, bookUpdate, saveRow, setTaxRate, uploadReceipt } from "./actions";
import type { AccountingData } from "./data";

const mx = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const pct = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);
const neg = (n: number) => (n < 0 ? "text-terracotta" : "");
const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
const dayLabel = (d: string) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—";
const today = () => new Date().toISOString().slice(0, 10);
const usd = (n: number, rate: number) => `${n < 0 ? "−" : ""}US$${Math.abs(Math.round(n / rate)).toLocaleString("en-US")}`;

/* ── Export for the accountant: CSV (opens directly in Excel) ──────────── */
function downloadCsv(filename: string, rows: AcctRow[], book: Book, period: string, tax: number, rate: number) {
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const p = (x: number | null) => (x == null ? "" : Math.round(x * 1000) / 10);
  const lines: unknown[][] = [
    [`Amanah Vacations — accounting ${period} (MXN; USD at ${rate} MXN per USD; tax ${tax}%)`],
    [],
    ["SERVICES"],
    ["Date", "Group", "Name", "Country", "People", "Service", "Description", "Came from", "Affiliate", "Provider", "Collected by",
      "Charged MXN", "Charged USD", "Method", "Our cost", "Fees", "Fee exact (Stripe)", "Commission", "Profit before comm.",
      "Net profit", "Margin before comm. %", "% after fees & comm.", "Tax", "Profit after tax", "Profit after tax USD", "% after tax", "Note"],
  ];
  for (const r of rows) {
    const m = rowMath(r, tax);
    lines.push([r.date, r.groupId, r.name, r.country, r.people, r.service, r.description, r.source, r.affiliate ?? "", r.provider, r.collectedBy,
      r.charged, Math.round(r.charged / rate), r.method, r.cost, r.fee, r.feeExact ? "yes" : "", r.commission, m.gross,
      m.net, p(m.marginBefore), p(m.marginAfterFees), m.tax, m.afterTax, Math.round(m.afterTax / rate), p(m.marginAfterTax), r.note]);
  }
  const t = totals(rows, tax);
  lines.push(["TOTAL", "", "", "", "", "", "", "", "", "", "", t.charged, Math.round(t.charged / rate), "", t.cost, t.fee, "", t.commission, t.gross, t.net, "", "", t.tax, t.afterTax, Math.round(t.afterTax / rate)]);
  const pays = book.payments.filter((x) => x.date.startsWith(period));
  lines.push([], ["PAYMENTS"], ["Date", "Partner", "Direction", "For", "Method", "Amount MXN", "Note", "Receipt"]);
  pays.forEach((x) => lines.push([x.date, x.partner, x.direction === "received" ? "They paid us" : "We paid them", x.kind, x.method, x.amount, x.note, x.receipt ? "yes" : ""]));
  const exps = book.expenses.filter((x) => x.date.startsWith(period));
  lines.push([], ["BUSINESS EXPENSES"], ["Date", "Expense", "Description", "Amount MXN", "Receipt"]);
  exps.forEach((x) => lines.push([x.date, x.name, x.description, x.amount, x.receipt ? "yes" : ""]));
  lines.push(["TOTAL EXPENSES", "", "", exps.reduce((s, x) => s + x.amount, 0)]);
  const csv = "\ufeff" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** "Attach receipt": uploads to the private bucket, hands back the stored path. */
function ReceiptPicker({ label = "Attach receipt", onUploaded }: { label?: string; onUploaded: (path: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-forest underline underline-offset-2">
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError("");
          const fd = new FormData();
          fd.append("file", file);
          const res = await uploadReceipt(fd);
          setBusy(false);
          if (res.ok && res.path) onUploaded(res.path);
          else setError(res.error ?? "Upload failed.");
        }}
      />
      {busy ? "Uploading…" : label}
      {error && <span className="font-medium text-terracotta no-underline">{error}</span>}
    </label>
  );
}

function ReceiptLink({ path, urls }: { path?: string; urls: Record<string, string> }) {
  if (!path) return null;
  return urls[path] ? (
    <a href={urls[path]} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-forest underline underline-offset-2">
      Receipt
    </a>
  ) : (
    <span className="text-[12px] text-sage">Receipt saved</span>
  );
}

const inputCls =
  "w-full rounded-lg border-[1.5px] border-sand bg-white px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-forest";
const labelCls = "mb-0.5 block text-[10px] font-semibold uppercase tracking-[1.2px] text-forest";
const btn =
  "rounded-full bg-forest px-4 py-2 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40";
const btnGhost =
  "rounded-full border border-sand bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:border-forest disabled:opacity-40";

const TABS = [
  { id: "log", label: "Monthly log" },
  { id: "balances", label: "Who owes whom" },
  { id: "payments", label: "Payments in / out" },
  { id: "commissions", label: "Commissions" },
  { id: "year", label: "Year summary" },
  { id: "expenses", label: "Business expenses" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AccountingClient({ rows, book, partners, rateUSD, receiptUrls }: AccountingData) {
  const [tab, setTab] = useState<Tab>("log");
  const [payDraft, setPayDraft] = useState<Partial<Payment> | null>(null);
  const tax = book.taxRate;
  const partnerNames = partners.map((p) => p.name);

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              tab === t.id ? "bg-forest text-white" : "border border-sand bg-white text-ink hover:border-forest"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "log" && <LogTab rows={rows} book={book} tax={tax} rate={rateUSD} partners={partners} />}
      {tab === "balances" && (
        <BalancesTab
          rows={rows}
          book={book}
          partners={partners}
          onSettle={(d) => {
            setPayDraft(d);
            setTab("payments");
          }}
        />
      )}
      {tab === "payments" && <PaymentsTab book={book} partnerNames={partnerNames} draft={payDraft} receiptUrls={receiptUrls} />}
      {tab === "commissions" && <CommissionsTab rows={rows} book={book} partners={partners} />}
      {tab === "year" && <YearTab rows={rows} book={book} partners={partners} rate={rateUSD} />}
      {tab === "expenses" && <ExpensesTab book={book} rate={rateUSD} receiptUrls={receiptUrls} />}
    </>
  );
}

/* ── Shared bits ──────────────────────────────────────────────────────── */

function Box({ title, desc, children, right }: { title?: string; desc?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-[18px] border border-sand bg-white p-5">
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-serif text-[20px] font-semibold text-ink">{title}</h2>}
            {desc && <p className="mt-0.5 max-w-[720px] text-[12.5px] leading-[1.6] text-sage">{desc}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, hint, bad }: { label: string; value: string; hint?: string; bad?: boolean }) {
  return (
    <div className="rounded-xl border border-sand bg-cream/40 p-3.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[1.5px] text-sage">{label}</div>
      <div className={`mt-1 font-serif text-[22px] font-semibold ${bad ? "text-terracotta" : "text-ink"}`}>{value}</div>
      {hint && <div className="text-[11.5px] text-sage">{hint}</div>}
    </div>
  );
}

const th = "whitespace-nowrap border-b border-sand px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-[1px] text-sage";
const td = "whitespace-nowrap border-b border-sand/60 px-2.5 py-2 text-[12.5px] text-ink";
const tdr = `${td} text-right tabular-nums`;

function useRun() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await fn();
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else {
      after?.();
      router.refresh();
    }
  };
  return { busy, error, run };
}

function totals(rs: AcctRow[], tax: number) {
  const t = { charged: 0, cost: 0, fee: 0, commission: 0, gross: 0, net: 0, tax: 0, afterTax: 0 };
  for (const r of rs) {
    const m = rowMath(r, tax);
    t.charged += r.charged;
    t.cost += r.cost;
    t.fee += r.fee;
    t.commission += r.commission;
    t.gross += m.gross;
    t.net += m.net;
    t.tax += m.tax;
    t.afterTax += m.afterTax;
  }
  return t;
}

/* ── Tab 1: monthly log ───────────────────────────────────────────────── */

function LogTab({ rows, book, tax, rate, partners }: { rows: AcctRow[]; book: Book; tax: number; rate: number; partners: Partner[] }) {
  const months = useMemo(() => {
    const set = new Set(rows.map((r) => r.date.slice(0, 7)).filter(Boolean));
    set.add(today().slice(0, 7));
    return [...set].sort().reverse();
  }, [rows]);
  const [month, setMonth] = useState(months[0]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // Filters (service, came from, collected by, method, country) — totals and the Excel follow them.
  const [flt, setFlt] = useState({ service: "", source: "", collectedBy: "", method: "", country: "" });
  const FILTERS: [keyof typeof flt, string][] = [["service", "All services"], ["source", "Came from: all"], ["collectedBy", "Collected by: all"], ["method", "All methods"], ["country", "All countries"]];
  const monthRows = rows.filter((r) => r.date.startsWith(month));
  const list = monthRows.filter((r) => FILTERS.every(([k]) => !flt[k] || (r[k] || "—") === flt[k]));
  const t = totals(list, tax);
  const groups = new Set(list.map((r) => r.groupId)).size;
  const idx = months.indexOf(month);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button className={btnGhost} disabled={idx >= months.length - 1} onClick={() => setMonth(months[idx + 1])}>←</button>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-full border border-sand bg-white px-4 py-2 text-[13.5px] font-semibold text-ink outline-none">
          {months.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
        <button className={btnGhost} disabled={idx <= 0} onClick={() => setMonth(months[idx - 1])}>→</button>
        <button className={`${btnGhost} ml-auto`} onClick={() => downloadCsv(`amanah-accounting-${month}.csv`, list, book, month, tax, rate)}>
          Download for my accountant (Excel)
        </button>
        <button className={btnGhost} onClick={() => setAdding((a) => !a)}>
          {adding ? "− Close" : "+ Add a service that isn't in the system"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map(([k, all]) => {
          const opts = [...new Set(monthRows.map((r) => r[k] || "—"))].sort();
          return (
            <select key={k} value={flt[k]} onChange={(e) => setFlt((f) => ({ ...f, [k]: e.target.value }))} className={`rounded-full border bg-white px-3.5 py-1.5 text-[12.5px] text-ink outline-none ${flt[k] ? "border-forest font-semibold" : "border-sand"}`}>
              <option value="">{all}</option>
              {opts.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          );
        })}
        {FILTERS.some(([k]) => flt[k]) && (
          <button className="text-[12.5px] font-semibold text-forest underline" onClick={() => setFlt({ service: "", source: "", collectedBy: "", method: "", country: "" })}>Clear filters</button>
        )}
      </div>

      {adding && (
        <Box title="New service line" desc="For anything sold outside the website and the booking forms. Bookings, transfers and TutCasa tours appear here on their own.">
          <EntryForm partners={partners} onDone={() => setAdding(false)} />
        </Box>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Groups / services" value={`${groups} / ${list.length}`} />
        <Stat label="Charged" value={mx(t.charged)} hint={usd(t.charged, rate)} />
        <Stat label="Our cost" value={mx(t.cost)} />
        <Stat label="Fees + commission" value={mx(t.fee + t.commission)} />
        <Stat label="Net profit" value={mx(t.net)} hint={pct(t.charged ? t.net / t.charged : null) + " of charged"} bad={t.net < 0} />
        <Stat label="After tax" value={mx(t.afterTax)} hint={`${usd(t.afterTax, rate)} · tax ${tax}%`} bad={t.afterTax < 0} />
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-sand bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {["Date", "Group", "Name", "Country", "Ppl", "Service", "Description", "Came from", "Provider", "Collected by"].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
              {["Charged", "Charged USD", "Method", "Our cost", "Fees", "Commission", "Net profit", "Margin before comm.", "% after fees & comm.", "Tax", "Profit after tax", "After tax USD", "% after tax"].map((h) => (
                <th key={h} className={`${th} ${h === "Method" ? "" : "text-right"}`}>{h}</th>
              ))}
              <th className={th}>Note</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={26} className="px-4 py-10 text-center text-[13px] italic text-sage">No services this month.</td>
              </tr>
            )}
            {list.map((r) => {
              const m = rowMath(r, tax);
              return (
                <Fragment key={r.key}>
                  <tr className="hover:bg-cream/50">
                    <td className={td}>{dayLabel(r.date)}</td>
                    <td className={`${td} font-mono text-[11.5px] text-sage`}>{r.groupId}</td>
                    <td className={`${td} font-medium`}>{r.name || "—"}</td>
                    <td className={td}>{r.country || <span className="text-sage">?</span>}</td>
                    <td className={tdr}>{r.people}</td>
                    <td className={td}>{r.service}</td>
                    <td className={`${td} max-w-[220px] truncate`} title={r.description}>{r.description || "—"}</td>
                    <td className={td}>{r.source}</td>
                    <td className={td}>{r.provider || <span className="text-sage">—</span>}</td>
                    <td className={td}>{r.collectedBy}</td>
                    <td className={tdr}>{mx(r.charged)}</td>
                    <td className={`${tdr} text-sage`}>{usd(r.charged, rate)}</td>
                    <td className={td}>{r.method || "—"}</td>
                    <td className={tdr}>{mx(r.cost)}</td>
                    <td className={tdr} title={r.fee ? (r.feeExact ? "Exact fee from Stripe" : "Estimated") : ""}>
                      {r.fee ? `${mx(r.fee)}${r.feeExact ? " ✓" : ""}` : "—"}
                    </td>
                    <td className={tdr}>{r.commission ? mx(r.commission) : "—"}</td>
                    <td className={`${tdr} font-semibold ${neg(m.net)}`}>{mx(m.net)}</td>
                    <td className={`${tdr} ${neg(m.gross)}`}>{pct(m.marginBefore)}</td>
                    <td className={`${tdr} ${neg(m.net)}`}>{pct(m.marginAfterFees)}</td>
                    <td className={tdr}>{m.tax ? mx(m.tax) : "—"}</td>
                    <td className={`${tdr} ${neg(m.afterTax)}`}>{mx(m.afterTax)}</td>
                    <td className={`${tdr} text-sage`}>{usd(m.afterTax, rate)}</td>
                    <td className={`${tdr} ${neg(m.afterTax)}`}>{pct(m.marginAfterTax)}</td>
                    <td className={`${td} max-w-[200px] truncate text-sage`} title={r.note}>{r.note}</td>
                    <td className={td}>
                      {r.editable ? (
                        <button className="text-[12px] font-semibold text-forest underline underline-offset-2" onClick={() => setEditing(editing === r.key ? null : r.key)}>
                          {editing === r.key ? "Close" : "Edit"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-sage" title="Automatic: TutCasa stays keep 10%">auto</span>
                      )}
                    </td>
                  </tr>
                  {editing === r.key && (
                    <tr>
                      <td colSpan={26} className="border-b border-sand bg-cream/40 px-4 py-4">
                        <RowEditor row={r} partners={partners} onDone={() => setEditing(null)} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {list.length > 0 && (
            <tfoot>
              <tr className="bg-cream/60 font-semibold">
                <td className={td} colSpan={10}>Total {monthLabel(month)}</td>
                <td className={tdr}>{mx(t.charged)}</td>
                <td className={tdr}>{usd(t.charged, rate)}</td>
                <td className={td} />
                <td className={tdr}>{mx(t.cost)}</td>
                <td className={tdr}>{mx(t.fee)}</td>
                <td className={tdr}>{mx(t.commission)}</td>
                <td className={`${tdr} ${neg(t.net)}`}>{mx(t.net)}</td>
                <td className={tdr}>{pct(t.charged ? t.gross / t.charged : null)}</td>
                <td className={tdr}>{pct(t.charged ? t.net / t.charged : null)}</td>
                <td className={tdr}>{mx(t.tax)}</td>
                <td className={`${tdr} ${neg(t.afterTax)}`}>{mx(t.afterTax)}</td>
                <td className={tdr}>{usd(t.afterTax, rate)}</td>
                <td className={tdr}>{pct(t.charged ? t.afterTax / t.charged : null)}</td>
                <td className={td} colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="mt-3 text-[12px] leading-[1.6] text-sage">
        <strong>Collected by</strong> = who received the client&apos;s money. If a partner collected it (TutCasa for its
        transfers, a driver paid in cash), they owe it to you — see &ldquo;Who owes whom&rdquo;. Fees marked ✓ are the exact
        amounts Stripe charged; others are estimates. A negative profit is shown in red — it&apos;s allowed.
      </p>
    </>
  );
}

function sourceOptions(partners: Partner[], current: string) {
  const list = [...SOURCES, ...partners.filter((p) => p.affiliate).map((p) => p.name)];
  return current && !list.includes(current) ? [current, ...list] : list;
}

function PartnerDatalist({ id, partners }: { id: string; partners: Partner[] }) {
  return (
    <datalist id={id}>
      {partners.map((p) => (
        <option key={p.id} value={p.name} />
      ))}
    </datalist>
  );
}

/** Edit one row. Sends only what changed; for entries the whole line is editable. */
function RowEditor({ row, partners, onDone }: { row: AcctRow; partners: Partner[]; onDone: () => void }) {
  const isEntry = row.key.startsWith("e:");
  const initial = {
    date: row.date, name: row.name, phone: row.phone ?? "", people: row.people, service: row.service, description: row.description,
    source: row.source, provider: row.provider, collectedBy: row.collectedBy, charged: row.charged, method: row.method,
    cost: row.cost, fee: row.fee, stripeRef: row.stripeRef, commission: row.commission, country: row.country, note: row.note,
  };
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, run } = useRun();
  const editable: (keyof typeof f)[] = isEntry
    ? (Object.keys(initial) as (keyof typeof f)[])
    : ["source", "provider", "collectedBy", "charged", "method", "cost", "fee", "stripeRef", "commission", "country", "note"];
  const save = () => {
    const patch: Record<string, string | number> = {};
    for (const k of editable) if (f[k] !== initial[k]) patch[k] = f[k];
    if (!Object.keys(patch).length) return onDone();
    run(() => saveRow(row.key, patch), onDone);
  };
  const num = (k: keyof typeof f) => (
    <input type="number" className={inputCls} value={f[k] === 0 ? "" : f[k]} placeholder="0" onChange={(e) => set(k, Number(e.target.value) || 0)} />
  );
  const listId = `partners-${row.key}`;

  return (
    <div>
      <PartnerDatalist id={listId} partners={partners} />
      <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {isEntry && (
          <>
            <div><span className={labelCls}>Date</span><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
            <div><span className={labelCls}>Name</span><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><span className={labelCls}>Phone</span><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 …" /></div>
            <div><span className={labelCls}>People</span>{num("people")}</div>
            <div>
              <span className={labelCls}>Service</span>
              <select className={inputCls} value={f.service} onChange={(e) => set("service", e.target.value)}>
                {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><span className={labelCls}>Description</span><input className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          </>
        )}
        <div>
          <span className={labelCls}>Came from</span>
          <select className={inputCls} value={f.source} onChange={(e) => set("source", e.target.value)}>
            {sourceOptions(partners, f.source).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Provider (did the service)</span><input list={listId} className={inputCls} value={f.provider} onChange={(e) => set("provider", e.target.value)} /></div>
        <div>
          <span className={labelCls}>Money collected by</span>
          <select className={inputCls} value={f.collectedBy} onChange={(e) => set("collectedBy", e.target.value)}>
            {["Amanah", ...partners.map((p) => p.name)].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Charged (MXN)</span>{num("charged")}</div>
        <div>
          <span className={labelCls}>Payment method</span>
          <select className={inputCls} value={f.method} onChange={(e) => set("method", e.target.value)}>
            {[...new Set(["", f.method, ...PAYMENT_METHODS])].map((m) => <option key={m} value={m}>{m || "—"}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Our cost</span>{num("cost")}</div>
        <div><span className={labelCls}>Fees (Stripe / PayPal)</span>{num("fee")}</div>
        {!isEntry && (
          <div>
            <span className={labelCls}>Stripe payment ID</span>
            <input className={inputCls} value={f.stripeRef} onChange={(e) => set("stripeRef", e.target.value.trim())} placeholder="pi_… or paste the Stripe link" />
          </div>
        )}
        <div><span className={labelCls}>Commission</span>{num("commission")}</div>
        <div><span className={labelCls}>Country</span><input className={inputCls} value={f.country} onChange={(e) => set("country", e.target.value)} /></div>
        <div className="sm:col-span-2"><span className={labelCls}>Note</span><input className={inputCls} value={f.note} onChange={(e) => set("note", e.target.value)} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btn} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        <button className={btnGhost} onClick={onDone}>Cancel</button>
        {isEntry && (
          <button
            className={`${btnGhost} ml-auto hover:border-terracotta hover:text-terracotta`}
            disabled={busy}
            onClick={() => confirm("Delete this line from the books?") && run(() => bookDelete("entries", row.key.slice(2)), onDone)}
          >
            Delete line
          </button>
        )}
        {error && <span className="text-[12px] font-medium text-terracotta">{error}</span>}
      </div>
    </div>
  );
}

function EntryForm({ partners, onDone }: { partners: Partner[]; onDone: () => void }) {
  const blank: Omit<LedgerEntry, "id"> = {
    date: today(), name: "", group: "", phone: "", country: "", people: 2, service: "Tour" as ServiceType, description: "",
    source: "WhatsApp / direct", provider: "", collectedBy: "Amanah", charged: 0, method: "Cash", cost: 0, fee: 0, commission: 0, note: "",
  };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, run } = useRun();
  const num = (k: keyof typeof f) => (
    <input type="number" className={inputCls} value={f[k] === 0 ? "" : f[k]} placeholder="0" onChange={(e) => set(k, Number(e.target.value) || 0)} />
  );
  return (
    <div>
      <PartnerDatalist id="partners-new" partners={partners} />
      <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <div><span className={labelCls}>Date *</span><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
        <div><span className={labelCls}>Client name *</span><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><span className={labelCls}>Phone</span><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 … (finds the country)" /></div>
        <div><span className={labelCls}>People</span>{num("people")}</div>
        <div>
          <span className={labelCls}>Service</span>
          <select className={inputCls} value={f.service} onChange={(e) => set("service", e.target.value)}>
            {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Description</span><input className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div>
          <span className={labelCls}>Came from</span>
          <select className={inputCls} value={f.source} onChange={(e) => set("source", e.target.value)}>
            {sourceOptions(partners, "").map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Provider</span><input list="partners-new" className={inputCls} value={f.provider} onChange={(e) => set("provider", e.target.value)} /></div>
        <div>
          <span className={labelCls}>Money collected by</span>
          <select className={inputCls} value={f.collectedBy} onChange={(e) => set("collectedBy", e.target.value)}>
            {["Amanah", ...partners.map((p) => p.name)].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Charged (MXN) *</span>{num("charged")}</div>
        <div>
          <span className={labelCls}>Payment method</span>
          <select className={inputCls} value={f.method} onChange={(e) => set("method", e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div><span className={labelCls}>Our cost</span>{num("cost")}</div>
        <div><span className={labelCls}>Fees</span>{num("fee")}</div>
        <div><span className={labelCls}>Commission</span>{num("commission")}</div>
        <div><span className={labelCls}>Country</span><input className={inputCls} value={f.country} onChange={(e) => set("country", e.target.value)} placeholder="auto from phone" /></div>
        <div><span className={labelCls}>Group code</span><input className={inputCls} value={f.group} onChange={(e) => set("group", e.target.value)} placeholder="optional" /></div>
        <div className="sm:col-span-2"><span className={labelCls}>Note</span><input className={inputCls} value={f.note} onChange={(e) => set("note", e.target.value)} /></div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button className={btn} disabled={busy || !f.name.trim() || !f.date} onClick={() => run(() => bookAdd("entries", f), onDone)}>
          {busy ? "Saving…" : "Add to the books"}
        </button>
        {error && <span className="text-[12px] font-medium text-terracotta">{error}</span>}
      </div>
    </div>
  );
}

/* ── Tab 2: who owes whom ─────────────────────────────────────────────── */

function BalancesTab({
  rows, book, partners, onSettle,
}: { rows: AcctRow[]; book: Book; partners: Partner[]; onSettle: (d: Partial<Payment>) => void }) {
  const all = buildBalances(rows, book.payments, partners).filter((b) => b.partnerId || b.lines.length);
  // Month by month like the Excel sheets (each month starts where the last ended), or a whole year.
  const thisMonth = new Date().toISOString().slice(0, 7);
  const first = all.flatMap((b) => b.lines.map((l) => l.date.slice(0, 7))).filter(Boolean).sort()[0] ?? thisMonth;
  const months: string[] = [];
  for (let m = thisMonth; m >= first; m = prevMonth(m)) months.push(m);
  const years = [...new Set(months.map((m) => m.slice(0, 4)))];
  const [year, setYear] = useState(thisMonth); // a month "2026-11" or a year "2026"
  const isYear = year.length === 4;
  const span = isYear ? "year" : "month";
  const [open, setOpen] = useState<string | null>(null);
  const current = year === thisMonth || year === thisMonth.slice(0, 4);

  const owedToUs = all.filter((b) => b.balance > 0).reduce((s, b) => s + b.balance, 0);
  const weOwe = all.filter((b) => b.balance < 0).reduce((s, b) => s - b.balance, 0);
  const list = all
    .map((b) => ({ b, st: periodStatement(b, year) }))
    .sort((x, y) => Math.abs(y.st.carried) - Math.abs(x.st.carried));
  const owe = (n: number) =>
    n === 0 ? <span className="text-sage">settled</span> : n > 0 ? <span className="text-forest">owes you {mx(n)}</span> : <span className="text-terracotta">you owe {mx(-n)}</span>;

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Stat label="Partners owe you (today)" value={mx(owedToUs)} />
        <Stat label="You owe partners (today)" value={mx(weOwe)} bad={weOwe > 0} />
      </div>
      <Box
        title={`Balances by partner — ${isYear ? year : monthLabel(year)}`}
        desc="A client who paid THEM (their card terminal, cash) → they owe you your profit. A client who paid YOU (Stripe, PayPal, Wise) → you owe them their cost. Then the payments either way. Commissions are in the Commissions tab."
        right={
          <select value={year} onChange={(e) => { setYear(e.target.value); setOpen(null); }} aria-label="Month or year" className="rounded-full border border-sand bg-white px-4 py-2 text-[13px] text-ink outline-none focus:border-forest">
            <optgroup label="Month">{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</optgroup>
            <optgroup label="Whole year">{years.map((y) => <option key={y} value={y}>{y} — whole year</option>)}</optgroup>
          </select>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {["Partner", `From last ${span}`, "They owe you (clients paid them)", "You owe them (clients paid you)", "They paid you", "You paid them", current ? "Balance now" : `End of ${span}`, ""].map((h, i) => (
                  <th key={h + i} className={`${th} ${i > 0 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(({ b, st }) => (
                <Fragment key={b.name}>
                  <tr>
                    <td className={`${td} font-semibold`}>
                      <button className="text-left hover:text-forest" onClick={() => setOpen(open === b.name ? null : b.name)} aria-expanded={open === b.name}>
                        {open === b.name ? "▾" : "▸"} {b.name}
                      </button>
                      {!b.partnerId && <span className="ml-1.5 text-[10.5px] font-normal text-sage">(not in Partners)</span>}
                    </td>
                    <td className={tdr}>{owe(st.broughtForward)}</td>
                    <td className={tdr}>{st.owesUs ? mx(st.owesUs) : "—"}</td>
                    <td className={tdr}>{st.weOwe ? mx(st.weOwe) : "—"}</td>
                    <td className={tdr}>{st.theyPaid ? mx(st.theyPaid) : "—"}</td>
                    <td className={tdr}>{st.wePaid ? mx(st.wePaid) : "—"}</td>
                    <td className={`${tdr} font-semibold`}>{owe(st.carried)}</td>
                    <td className={td}>
                      {current && b.balance !== 0 && (
                        <button
                          className="text-[12px] font-semibold text-forest underline underline-offset-2"
                          onClick={() => onSettle({ partner: b.name, direction: b.balance > 0 ? "received" : "made", amount: Math.abs(b.balance), kind: "settlement" })}
                        >
                          Settle…
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === b.name && (
                    <tr>
                      <td colSpan={8} className="border-b border-sand bg-cream/60 px-3 py-3">
                        <BalanceLines start={st.broughtForward} lines={st.lines} span={span} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-sage">
          Like your monthly sheets: each month starts with what was owed at the end of the month before. No typed-in opening numbers: everything comes from the bookings and payments on record (July–August spreadsheet lines included), so each amount can be traced to a line.
        </p>
      </Box>
    </>
  );
}

const prevMonth = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
};

/** Everything behind one partner's balance, with the running total. */
function BalanceLines({ start, lines, span }: { start: number; lines: BalanceLine[]; span: string }) {
  let run = start;
  const say = (n: number) => (n > 0 ? `owes you ${mx(n)}` : n < 0 ? `you owe ${mx(-n)}` : "settled");
  return (
    <table className="min-w-full border-collapse text-[12.5px]">
      <thead>
        <tr>{["Date", "What", "Effect", "Balance after"].map((h, i) => <th key={h} className={`${th} ${i > 1 ? "text-right" : ""}`}>{h}</th>)}</tr>
      </thead>
      <tbody>
        <tr>
          <td className={td} />
          <td className={`${td} text-sage`}>From last {span}</td>
          <td className={tdr} />
          <td className={tdr}>{say(start)}</td>
        </tr>
        {lines.length === 0 && (
          <tr><td className={td} /><td className={`${td} italic text-sage`} colSpan={3}>Nothing yet.</td></tr>
        )}
        {lines.map((l, i) => {
          run += l.amount;
          return (
            <tr key={i}>
              <td className={`${td} whitespace-nowrap`}>{l.date}</td>
              <td className={td}>{l.label}</td>
              <td className={`${tdr} ${l.amount < 0 ? "text-terracotta" : "text-forest"}`}>{l.amount > 0 ? "+" : "−"}{mx(Math.abs(l.amount))}</td>
              <td className={tdr}>{say(run)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Tab 3: payments received / made ──────────────────────────────────── */

function PaymentsTab({ book, partnerNames, draft, receiptUrls }: { book: Book; partnerNames: string[]; draft: Partial<Payment> | null; receiptUrls: Record<string, string> }) {
  const blank: Omit<Payment, "id"> = {
    date: today(), partner: partnerNames[0] ?? "", direction: "received", kind: "settlement", method: "Bank transfer", amount: 0, note: "",
    ...(draft ?? {}),
  };
  const [f, setF] = useState(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, run } = useRun();
  const reset = () => {
    setEditId(null);
    setF({ ...blank, partner: f.partner, amount: 0, note: "", receipt: undefined });
  };
  const list = [...book.payments].sort((a, b) => b.date.localeCompare(a.date));
  const inTotal = list.filter((p) => p.direction === "received").reduce((s, p) => s + p.amount, 0);
  const outTotal = list.filter((p) => p.direction === "made").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Box title={editId ? "Edit payment" : "Record a payment"} desc="Money a partner paid you (e.g. TutCasa paying for transfers) or money you paid a partner (a driver's cost, a commission).">
        <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
          <div><span className={labelCls}>Date</span><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div>
            <span className={labelCls}>Partner</span>
            <input list="pay-partners" className={inputCls} value={f.partner} onChange={(e) => set("partner", e.target.value)} />
            <datalist id="pay-partners">{partnerNames.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <span className={labelCls}>Direction</span>
            <select className={inputCls} value={f.direction} onChange={(e) => set("direction", e.target.value)}>
              <option value="received">They paid us</option>
              <option value="made">We paid them</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>For</span>
            <select className={inputCls} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
              <option value="settlement">Services / balance</option>
              <option value="commission">Commission</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>Method</span>
            <select className={inputCls} value={f.method} onChange={(e) => set("method", e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><span className={labelCls}>Amount (MXN)</span><input type="number" className={inputCls} value={f.amount || ""} onChange={(e) => set("amount", Number(e.target.value) || 0)} /></div>
          <div><span className={labelCls}>Note</span><input className={inputCls} value={f.note} onChange={(e) => set("note", e.target.value)} /></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {f.receipt ? <span className="text-[12px] text-forest">Receipt attached ✓</span> : <ReceiptPicker onUploaded={(path) => set("receipt", path)} />}
          <button
            className={btn}
            disabled={busy || !f.partner.trim() || !(f.amount > 0)}
            onClick={() => {
              const { id: _id, ...data } = f as Payment;
              run(() => (editId ? bookUpdate("payments", editId, data) : bookAdd("payments", data)), reset);
            }}
          >
            {busy ? "Saving…" : editId ? "Save changes" : "Record payment"}
          </button>
          {editId && <button className={btnGhost} onClick={reset}>Cancel</button>}
          {error && <span className="text-[12px] font-medium text-terracotta">{error}</span>}
        </div>
      </Box>

      <Box title="All payments" right={<div className="text-[12.5px] text-sage">In {mx(inTotal)} · Out {mx(outTotal)}</div>}>
        {list.length === 0 ? (
          <p className="text-[13px] italic text-sage">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>{["Date", "Partner", "", "For", "Method", "Amount", "Note", "Receipt", ""].map((h, i) => <th key={i} className={`${th} ${h === "Amount" ? "text-right" : ""}`}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>{p.date}</td>
                    <td className={`${td} font-medium`}>{p.partner}</td>
                    <td className={td}>
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${p.direction === "received" ? "bg-forest/10 text-forest" : "bg-terracotta/10 text-terracotta"}`}>
                        {p.direction === "received" ? "IN" : "OUT"}
                      </span>
                    </td>
                    <td className={td}>{p.kind === "commission" ? "Commission" : "Services"}</td>
                    <td className={td}>{p.method}</td>
                    <td className={tdr}>{mx(p.amount)}</td>
                    <td className={`${td} text-sage`}>{p.note}</td>
                    <td className={td}>
                      {p.receipt ? (
                        <ReceiptLink path={p.receipt} urls={receiptUrls} />
                      ) : (
                        <ReceiptPicker label="Attach" onUploaded={(path) => run(() => bookUpdate("payments", p.id, { receipt: path }))} />
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <button className="mr-3 text-[12px] font-semibold text-forest hover:underline" onClick={() => { setEditId(p.id); setF({ ...p }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                        Edit
                      </button>
                      <button className="text-[12px] text-sage hover:text-terracotta" disabled={busy} onClick={() => confirm("Delete this payment?") && run(() => bookDelete("payments", p.id))}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}

/* ── Tab 4: commissions owed to affiliates ────────────────────────────── */

function CommissionsTab({ rows, book, partners }: { rows: AcctRow[]; book: Book; partners: Partner[] }) {
  const affiliates = partners.filter((p) => p.affiliate);
  return (
    <>
      {affiliates.length === 0 && <Box><p className="text-[13px] text-sage">No affiliates yet — add one in Partners &amp; Affiliates.</p></Box>}
      {affiliates.map((a) => {
        const earnedRows = rows.filter((r) => r.affiliate === a.name && r.commission);
        const paidRows = book.payments.filter((p) => p.kind === "commission" && p.direction === "made" && matchPartner(p.partner, partners)?.id === a.id);
        const months = [...new Set([...earnedRows.map((r) => r.date.slice(0, 7)), ...paidRows.map((p) => p.date.slice(0, 7))])].sort();
        let running = 0;
        const table = months.map((m) => {
          const earned = earnedRows.filter((r) => r.date.startsWith(m)).reduce((s, r) => s + r.commission, 0);
          const paid = paidRows.filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0);
          running += earned - paid;
          return { m, earned, paid, running };
        });
        return (
          <Box
            key={a.id}
            title={`${a.name} — commission`}
            desc={`${a.commissionPct}% on tours, packages and parks${a.commissionPctGroup ? ` (${a.commissionPctGroup}% from ${a.commissionGroupFrom} people)` : ""}. Record a payment with “For: Commission” when you pay it.`}
            right={<Stat label="Still to pay" value={mx(running)} bad={running > 0} />}
          >
            {table.length === 0 ? (
              <p className="text-[13px] italic text-sage">Nothing yet.</p>
            ) : (
              <table className="mb-4 min-w-full border-collapse">
                <thead><tr>{["Month", "Earned", "Paid", "Still to pay"].map((h, i) => <th key={h} className={`${th} ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
                <tbody>
                  {table.map((t) => (
                    <tr key={t.m}>
                      <td className={td}>{monthLabel(t.m)}</td>
                      <td className={tdr}>{mx(t.earned)}</td>
                      <td className={tdr}>{t.paid ? mx(t.paid) : "—"}</td>
                      <td className={`${tdr} font-semibold`}>{mx(t.running)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {earnedRows.length > 0 && (
              <details>
                <summary className="cursor-pointer text-[12.5px] font-semibold text-forest">Bookings that earned commission ({earnedRows.length})</summary>
                <table className="mt-2 min-w-full border-collapse">
                  <tbody>
                    {earnedRows.map((r) => (
                      <tr key={r.key}>
                        <td className={td}>{r.date}</td>
                        <td className={td}>{r.name}</td>
                        <td className={td}>{r.description}</td>
                        <td className={tdr}>{r.people} ppl</td>
                        <td className={tdr}>{mx(r.charged)}</td>
                        <td className={`${tdr} font-semibold`}>{mx(r.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </Box>
        );
      })}
    </>
  );
}

/* ── Tab 5: year summary ──────────────────────────────────────────────── */

function Breakdown({ title, rows, tax, by }: { title: string; rows: AcctRow[]; tax: number; by: (r: AcctRow) => string }) {
  const map = new Map<string, AcctRow[]>();
  rows.forEach((r) => {
    const k = by(r) || "Unknown";
    map.set(k, [...(map.get(k) ?? []), r]);
  });
  const lines = [...map.entries()]
    .map(([k, rs]) => ({ k, n: rs.length, groups: new Set(rs.map((r) => r.groupId)).size, ...totals(rs, tax) }))
    .sort((a, b) => b.charged - a.charged);
  return (
    <div className="rounded-xl border border-sand p-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-terracotta">{title}</div>
      <table className="min-w-full border-collapse">
        <thead><tr>{["", "Services", "Charged", "Net profit"].map((h, i) => <th key={i} className={`${th} ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.k}>
              <td className={td}>{l.k}</td>
              <td className={tdr}>{l.n}</td>
              <td className={tdr}>{mx(l.charged)}</td>
              <td className={`${tdr} ${neg(l.net)}`}>{mx(l.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function YearTab({ rows, book, partners, rate }: { rows: AcctRow[]; book: Book; partners: Partner[]; rate: number }) {
  const years = [...new Set([...rows.map((r) => r.date.slice(0, 4)), today().slice(0, 4)])].filter(Boolean).sort().reverse();
  const [year, setYear] = useState(years[0]);
  const [taxInput, setTaxInput] = useState(String(book.taxRate));
  const { busy, run } = useRun();
  const tax = book.taxRate;
  const yr = rows.filter((r) => r.date.startsWith(year));
  const t = totals(yr, tax);
  const expenses = book.expenses.filter((e) => e.date.startsWith(year)).sort((a, b) => a.date.localeCompare(b.date));
  const expTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const groups = new Set(yr.map((r) => r.groupId)).size;
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-full border border-sand bg-white px-4 py-2 text-[13.5px] font-semibold text-ink outline-none">
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <button className={btnGhost} onClick={() => downloadCsv(`amanah-accounting-${year}.csv`, yr, book, year, tax, rate)}>
          Download the year for my accountant (Excel)
        </button>
        <div className="ml-auto flex items-center gap-2 text-[12.5px] text-sage">
          Tax rate
          <input type="number" min={0} max={100} value={taxInput} onChange={(e) => setTaxInput(e.target.value)} className="w-16 rounded-lg border-[1.5px] border-sand bg-white px-2 py-1.5 text-right text-[12.5px] text-ink outline-none focus:border-forest" />%
          {Number(taxInput) !== tax && (
            <button className={btnGhost} disabled={busy} onClick={() => run(() => setTaxRate(Number(taxInput) || 0))}>Save</button>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Groups / services" value={`${groups} / ${yr.length}`} hint={groups ? `${(yr.length / groups).toFixed(1)} services per group` : undefined} />
        <Stat label="Revenue" value={mx(t.charged)} hint={`${usd(t.charged, rate)}${groups ? ` · ${mx(t.charged / groups)} avg per group` : ""}`} />
        <Stat label="Our cost" value={mx(t.cost)} />
        <Stat label="Fees + commission" value={mx(t.fee + t.commission)} />
        <Stat label="Profit after tax" value={mx(t.afterTax)} hint={`${usd(t.afterTax, rate)} · ${pct(t.charged ? t.afterTax / t.charged : null)} margin`} bad={t.afterTax < 0} />
        <Stat label="After expenses" value={mx(t.afterTax - expTotal)} hint={`expenses ${mx(expTotal)}`} bad={t.afterTax - expTotal < 0} />
      </div>

      <Box title={`${year} month by month`}>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {["Month", "Groups", "Services", "Revenue", "Revenue USD", "Our cost", "Profit before comm.", "Fees", "Commission", "Net profit", "Tax", "Profit after tax", "After tax USD", "Margin before comm.", "Margin after tax"].map((h, i) => (
                  <th key={h} className={`${th} ${i ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => {
                const rs = yr.filter((r) => r.date.startsWith(m));
                const mt = totals(rs, tax);
                return (
                  <tr key={m} className={rs.length ? "" : "text-sage"}>
                    <td className={td}>{monthLabel(m)}</td>
                    <td className={tdr}>{new Set(rs.map((r) => r.groupId)).size || "—"}</td>
                    <td className={tdr}>{rs.length || "—"}</td>
                    <td className={tdr}>{mt.charged ? mx(mt.charged) : "—"}</td>
                    <td className={`${tdr} text-sage`}>{mt.charged ? usd(mt.charged, rate) : "—"}</td>
                    <td className={tdr}>{mt.cost ? mx(mt.cost) : "—"}</td>
                    <td className={`${tdr} ${neg(mt.gross)}`}>{rs.length ? mx(mt.gross) : "—"}</td>
                    <td className={tdr}>{mt.fee ? mx(mt.fee) : "—"}</td>
                    <td className={tdr}>{mt.commission ? mx(mt.commission) : "—"}</td>
                    <td className={`${tdr} font-semibold ${neg(mt.net)}`}>{rs.length ? mx(mt.net) : "—"}</td>
                    <td className={tdr}>{mt.tax ? mx(mt.tax) : "—"}</td>
                    <td className={`${tdr} ${neg(mt.afterTax)}`}>{rs.length ? mx(mt.afterTax) : "—"}</td>
                    <td className={`${tdr} text-sage`}>{rs.length ? usd(mt.afterTax, rate) : "—"}</td>
                    <td className={tdr}>{pct(mt.charged ? mt.gross / mt.charged : null)}</td>
                    <td className={tdr}>{pct(mt.charged ? mt.afterTax / mt.charged : null)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-cream/60 font-semibold">
                <td className={td}>Total</td>
                <td className={tdr}>{groups}</td>
                <td className={tdr}>{yr.length}</td>
                <td className={tdr}>{mx(t.charged)}</td>
                <td className={tdr}>{usd(t.charged, rate)}</td>
                <td className={tdr}>{mx(t.cost)}</td>
                <td className={`${tdr} ${neg(t.gross)}`}>{mx(t.gross)}</td>
                <td className={tdr}>{mx(t.fee)}</td>
                <td className={tdr}>{mx(t.commission)}</td>
                <td className={`${tdr} ${neg(t.net)}`}>{mx(t.net)}</td>
                <td className={tdr}>{mx(t.tax)}</td>
                <td className={`${tdr} ${neg(t.afterTax)}`}>{mx(t.afterTax)}</td>
                <td className={tdr}>{usd(t.afterTax, rate)}</td>
                <td className={tdr}>{pct(t.charged ? t.gross / t.charged : null)}</td>
                <td className={tdr}>{pct(t.charged ? t.afterTax / t.charged : null)}</td>
              </tr>
              <tr>
                <td className={td} colSpan={11}>Business expenses ({expenses.length})</td>
                <td className={`${tdr} text-terracotta`}>−{mx(expTotal)}</td>
                <td className={td} colSpan={3} />
              </tr>
              <tr className="font-semibold">
                <td className={td} colSpan={11}>Profit after tax and expenses</td>
                <td className={`${tdr} ${neg(t.afterTax - expTotal)}`}>{mx(t.afterTax - expTotal)}</td>
                <td className={tdr}>{usd(t.afterTax - expTotal, rate)}</td>
                <td className={td} colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Box>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Breakdown title="By service" rows={yr} tax={tax} by={(r) => r.service} />
        <Breakdown title="Where clients came from" rows={yr} tax={tax} by={(r) => r.source} />
        <Breakdown title="By payment method" rows={yr} tax={tax} by={(r) => r.method} />
        <Breakdown title="By country" rows={yr} tax={tax} by={(r) => r.country} />
        <Breakdown title="By provider" rows={yr} tax={tax} by={(r) => matchPartner(r.provider, partners)?.name ?? (!r.provider.trim() || /^amanah/i.test(r.provider.trim()) ? "Amanah (ourselves)" : r.provider)} />
      </div>

      <p className="text-[12.5px] text-sage">Business expenses (RFC, accountant, ads…) are in their own tab and come off the year&apos;s profit above.</p>
    </>
  );
}

/* ── Tab 6: business expenses ─────────────────────────────────────────── */

function downloadExpenses(filename: string, expenses: Book["expenses"], rate: number) {
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const lines: unknown[][] = [
    ["Date", "Expense", "Description", "Amount MXN", "Amount USD", "Receipt"],
    ...expenses.map((e) => [e.date, e.name, e.description, e.amount, Math.round(e.amount / rate), e.receipt ? "yes" : ""]),
    ["TOTAL", "", "", total, Math.round(total / rate), ""],
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.map((l) => l.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function ExpensesTab({ book, rate, receiptUrls }: { book: Book; rate: number; receiptUrls: Record<string, string> }) {
  const years = [...new Set([...book.expenses.map((e) => e.date.slice(0, 4)), today().slice(0, 4)])].sort().reverse();
  const [year, setYear] = useState(years[0]);
  const [exp, setExp] = useState<{ date: string; name: string; description: string; amount: number; receipt?: string }>({ date: today(), name: "", description: "", amount: 0 });
  const { busy, error, run } = useRun();
  const list = book.expenses.filter((e) => e.date.startsWith(year)).sort((a, b) => a.date.localeCompare(b.date));
  const total = list.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-full border border-sand bg-white px-4 py-2 text-[13.5px] font-semibold text-ink outline-none">
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <button className={btnGhost} disabled={!list.length} onClick={() => downloadExpenses(`amanah-expenses-${year}.csv`, list, rate)}>
          Download expenses (Excel)
        </button>
        <div className="ml-auto"><Stat label={`Total ${year}`} value={mx(total)} hint={usd(total, rate)} /></div>
      </div>

      <Box title="Add an expense" desc="Costs that aren't tied to one client — RFC, accountant, phone, ads, website. They come off the year's profit.">
        <div className="grid gap-2.5 sm:grid-cols-4">
          <div><span className={labelCls}>Date</span><input type="date" className={inputCls} value={exp.date} onChange={(e) => setExp({ ...exp, date: e.target.value })} /></div>
          <div><span className={labelCls}>Expense</span><input className={inputCls} value={exp.name} onChange={(e) => setExp({ ...exp, name: e.target.value })} placeholder="e.g. Accountant" /></div>
          <div><span className={labelCls}>Description</span><input className={inputCls} value={exp.description} onChange={(e) => setExp({ ...exp, description: e.target.value })} /></div>
          <div><span className={labelCls}>Amount (MXN)</span><input type="number" className={inputCls} value={exp.amount || ""} onChange={(e) => setExp({ ...exp, amount: Number(e.target.value) || 0 })} /></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {exp.receipt ? <span className="text-[12px] text-forest">Receipt attached ✓</span> : <ReceiptPicker onUploaded={(path) => setExp({ ...exp, receipt: path })} />}
          <button
            className={btn}
            disabled={busy || !exp.name.trim() || !(exp.amount > 0)}
            onClick={() => run(() => bookAdd("expenses", exp), () => setExp({ date: today(), name: "", description: "", amount: 0 }))}
          >
            Add expense
          </button>
          {error && <span className="text-[12px] font-medium text-terracotta">{error}</span>}
        </div>
      </Box>

      <Box title={`Expenses ${year}`}>
        {list.length === 0 ? (
          <p className="text-[13px] italic text-sage">No expenses recorded for {year}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>{["Date", "Expense", "Description", "Amount", "USD", "Receipt", ""].map((h, i) => <th key={i} className={`${th} ${h === "Amount" || h === "USD" ? "text-right" : ""}`}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id}>
                    <td className={td}>{e.date}</td>
                    <td className={`${td} font-medium`}>{e.name}</td>
                    <td className={`${td} text-sage`}>{e.description}</td>
                    <td className={tdr}>{mx(e.amount)}</td>
                    <td className={`${tdr} text-sage`}>{usd(e.amount, rate)}</td>
                    <td className={td}>
                      {e.receipt ? (
                        <ReceiptLink path={e.receipt} urls={receiptUrls} />
                      ) : (
                        <ReceiptPicker label="Attach receipt" onUploaded={(path) => run(() => bookUpdate("expenses", e.id, { receipt: path }))} />
                      )}
                    </td>
                    <td className={td}>
                      <button className="text-[12px] text-sage hover:text-terracotta" disabled={busy} onClick={() => confirm("Delete this expense?") && run(() => bookDelete("expenses", e.id))}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cream/60 font-semibold">
                  <td className={td} colSpan={3}>Total {year}</td>
                  <td className={tdr}>{mx(total)}</td>
                  <td className={tdr}>{usd(total, rate)}</td>
                  <td className={td} colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}


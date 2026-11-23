"use client";

import { useState } from "react";
import { PageHead } from "../AdminUI";
import { createManualOrder, updateOrder, updateOrderStatus } from "./actions";
import { ORDER_STATUSES, type AdminOrder } from "./types";
import { PAYMENT_METHODS, SOURCES, estimateFee } from "@/lib/accounting";

const fmtMXN = (n: number) => `$${n.toLocaleString("en-US")} MXN`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const STATUS_STYLES: Record<string, string> = {
  "Pending payment": "bg-sand text-sage",
  "Pending confirmation": "bg-gold/15 text-[#8a6a1e]",
  Paid: "bg-forest/15 text-forest",
  "Paid (test mode)": "bg-forest/15 text-forest",
  Confirmed: "bg-forest/10 text-forest",
  Completed: "bg-forest/15 text-forest",
  Cancelled: "bg-terracotta/10 text-terracotta",
};

type CatalogOption = { id: string; name: string };
type PartnerOption = { name: string; affiliate: boolean; provider: boolean };
type Catalogs = { tour: CatalogOption[]; package: CatalogOption[]; park: CatalogOption[] };
type Kind = "tour" | "package" | "park";
const KIND_LABEL: Record<Kind, string> = { tour: "tour", package: "package", park: "park" };
// "Card" = the provider's own card terminal (the 5% goes to their processor);
// cards WE charge always go through Stripe or PayPal.
const METHOD_LABEL: Record<string, string> = { Card: "Card (provider's terminal)" };

/** Type badge for the list: what the booking mainly is. */
function orderType(o: AdminOrder): string {
  const it = o.items ?? [];
  if (o.source === "tutcasa") return "Tour · TutCasa";
  if (it.some((i) => i.kind === "package" || (i.meta?.pkgId && i.meta.pkgId !== "tour"))) return "Package";
  if (it.some((i) => i.kind === "tour" || i.meta?.tour_key)) return "Tour";
  if (it.some((i) => i.meta?.activity_id)) return "Park";
  if (it.some((i) => i.kind === "stay")) return "Stay";
  return "Activity";
}

type Fields = {
  kind: Kind; catalogId: string; title: string; customerName: string; customerPhone: string; customerEmail: string;
  people: number; date: string; totalMXN: number; paymentMethod: string; cardSurcharge: boolean; stripeFee: number; stripeRef: string;
  source: string; extraActivity: string; extraActivityPrice: number; customization: string; costMXN: number;
  performedBy: string; notes: string;
};

const BLANK: Fields = {
  kind: "tour", catalogId: "", title: "", customerName: "", customerPhone: "", customerEmail: "", people: 2, date: "",
  totalMXN: 0, paymentMethod: "Cash", cardSurcharge: true, stripeFee: 0, stripeRef: "", source: "WhatsApp / direct",
  extraActivity: "", extraActivityPrice: 0, customization: "", costMXN: 0, performedBy: "", notes: "",
};

/** "2026-10-29" or "August 26, 2026" → YYYY-MM-DD for the date input. */
function isoDate(raw?: string): string {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const t = new Date(raw);
  return Number.isNaN(+t) ? "" : `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

/** Prefill the form from an existing order. */
function fieldsFromOrder(o: AdminOrder, partners: PartnerOption[]): Fields {
  const items = o.items ?? [];
  const fee = items.find((i) => i.title.startsWith("Card payment fee"));
  const extra = items.find((i) => i.id === "m2");
  const main = items.find((i) => i !== fee && i !== extra) ?? items[0];
  const m = (main?.meta ?? {}) as Record<string, string>;
  const kind: Kind = m.pkgId && m.pkgId !== "tour" ? "package" : m.activity_id ? "park" : "tour";
  const referrerName = partners.find((p) => p.name.toLowerCase() === (o.referrer ?? "").toLowerCase())?.name ?? (o.referrer === "tutcasa" ? "TutCasa" : "");
  return {
    kind,
    catalogId: m.tour_key || m.pkgId || m.activity_id || "",
    title: main?.title ?? "",
    customerName: o.customer_name,
    customerPhone: o.customer_whatsapp ?? "",
    customerEmail: o.customer_email ?? "",
    people: main?.people || 1,
    date: isoDate(m.date || m.checkin),
    totalMXN: o.total - (fee?.total ?? 0),
    paymentMethod: o.payment_method,
    cardSurcharge: Boolean(fee),
    stripeFee: Number(o.acct?.fee) || 0,
    stripeRef: o.acct?.stripeRef ?? "",
    source: o.acct?.source ?? (referrerName || (o.source === "manual" ? "WhatsApp / direct" : "Website")),
    extraActivity: extra?.title ?? "",
    extraActivityPrice: extra?.total ?? 0,
    customization: m.custom ?? "",
    costMXN: Number(m.manual_cost ?? o.acct?.cost) || 0,
    performedBy: m.performed_by ?? o.acct?.provider ?? "",
    notes: o.notes ?? "",
  };
}

/** One form for "add a booking" and "edit". `limited` = website order: its
    paid items and price are fixed; only customer and accounting info change. */
function OrderForm({
  initial, submitLabel, onSubmit, catalogs, partners, limited = false,
}: {
  initial: Fields;
  submitLabel: string;
  onSubmit: (f: Fields & { stripeFee: number }) => Promise<{ ok: boolean; error?: string }>;
  catalogs: Catalogs;
  partners: PartnerOption[];
  limited?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState(initial);
  const options = catalogs[f.kind];
  const isCard = f.paymentMethod === "Card" || f.paymentMethod === "Stripe";
  const surcharge = isCard && f.cardSurcharge ? Math.round(f.totalMXN * 0.05) : 0;
  const feeEstimate = estimateFee("Stripe", f.totalMXN + surcharge);
  const set = (k: keyof Fields, v: string | number | boolean) => setF((p) => ({ ...p, [k]: v }));
  const inputCls = "w-full rounded-xl border-[1.5px] border-sand bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-forest";
  const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest";
  const methods = [...new Set([f.paymentMethod, ...PAYMENT_METHODS].filter(Boolean))];
  const sources = [...new Set([f.source, ...SOURCES, ...partners.filter((p) => p.affiliate).map((p) => p.name)])];

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const title = options.find((o) => o.id === f.catalogId)?.name ?? f.title;
    const res = await onSubmit({ ...f, title, stripeFee: f.paymentMethod === "Stripe" ? f.stripeFee || (f.stripeRef ? 0 : feeEstimate) : 0 });
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
  };

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {!limited && (
        <>
          <div>
            <span className={labelCls}>Type</span>
            <select className={inputCls} value={f.kind} onChange={(e) => setF((p) => ({ ...p, kind: e.target.value as Kind, catalogId: "" }))}>
              <option value="tour">Tour</option>
              <option value="package">Package</option>
              <option value="park">Park</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>Which {KIND_LABEL[f.kind]}</span>
            <select className={inputCls} value={f.catalogId} onChange={(e) => set("catalogId", e.target.value)}>
              <option value="">{f.title && !f.catalogId ? f.title : "Choose…"}</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </>
      )}
      <div><span className={labelCls}>Customer name *</span><input className={inputCls} value={f.customerName} onChange={(e) => set("customerName", e.target.value)} /></div>
      <div><span className={labelCls}>Customer phone</span><input className={inputCls} value={f.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+1 ..." /></div>
      <div><span className={labelCls}>Customer email</span><input type="email" className={inputCls} value={f.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} /></div>
      {!limited && (
        <>
          <div><span className={labelCls}>{f.kind === "package" ? "Check-in *" : `${f.kind === "park" ? "Park" : "Tour"} date *`}</span><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div><span className={labelCls}>People</span><input type="number" min={1} className={inputCls} value={f.people === 0 ? "" : f.people} onChange={(e) => set("people", Number(e.target.value) || 1)} /></div>
          <div><span className={labelCls}>Price (before card fee)</span><input type="number" min={0} className={inputCls} value={f.totalMXN === 0 ? "" : f.totalMXN} onChange={(e) => set("totalMXN", Number(e.target.value) || 0)} placeholder="MXN" /></div>
          <div>
            <span className={labelCls}>Payment method</span>
            <select className={inputCls} value={f.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
              {methods.map((m) => (<option key={m} value={m}>{METHOD_LABEL[m] ?? m}</option>))}
            </select>
          </div>
          {isCard && (
            <div>
              <label className={labelCls + " flex items-center gap-1.5"}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-forest" checked={f.cardSurcharge} onChange={(e) => set("cardSurcharge", e.target.checked)} />
                Client pays +5% card fee
              </label>
              <div className="rounded-xl border-[1.5px] border-sand bg-cream px-3.5 py-2.5 text-[13px] text-ink">
                {surcharge ? <>+${surcharge.toLocaleString("en-US")} → client pays <strong>${(f.totalMXN + surcharge).toLocaleString("en-US")}</strong></> : "No surcharge"}
              </div>
              {f.paymentMethod === "Card" && surcharge > 0 && <p className="mt-1 text-[11px] text-sage">The 5% goes to the provider&apos;s card processor, not to you.</p>}
            </div>
          )}
          {f.paymentMethod === "Stripe" && (
            <div>
              <span className={labelCls}>Stripe payment ID or link</span>
              <input className={inputCls} value={f.stripeRef} onChange={(e) => set("stripeRef", e.target.value.trim())} placeholder="pi_… or paste the Stripe link" />
              <p className="mt-1 text-[11px] text-sage">Accounting then reads Stripe&apos;s real fee and the pesos you actually received.</p>
            </div>
          )}
          {f.paymentMethod === "Stripe" && !f.stripeRef && (
            <div>
              <span className={labelCls}>Stripe fee (what Stripe keeps)</span>
              <input type="number" min={0} className={inputCls} value={f.stripeFee === 0 ? "" : f.stripeFee} onChange={(e) => set("stripeFee", Number(e.target.value) || 0)} placeholder={`≈ ${feeEstimate} (estimate)`} />
            </div>
          )}
        </>
      )}
      <div>
        <span className={labelCls}>Came from / affiliate</span>
        <select className={inputCls} value={f.source} onChange={(e) => set("source", e.target.value)}>
          {sources.map((s) => (<option key={s} value={s}>{partners.some((p) => p.affiliate && p.name === s) ? `${s} (affiliate — commission)` : s}</option>))}
        </select>
      </div>
      {!limited && (
        <>
          <div className="sm:col-span-2"><span className={labelCls}>Extra activity added</span><input className={inputCls} value={f.extraActivity} onChange={(e) => set("extraActivity", e.target.value)} placeholder="e.g. Cenote Azul (optional)" /></div>
          <div><span className={labelCls}>Extra activity price</span><input type="number" min={0} className={inputCls} value={f.extraActivityPrice === 0 ? "" : f.extraActivityPrice} onChange={(e) => set("extraActivityPrice", Number(e.target.value) || 0)} placeholder="MXN — part of the price" /></div>
        </>
      )}
      <div><span className={labelCls}>Our cost (whole booking)</span><input type="number" min={0} className={inputCls} value={f.costMXN === 0 ? "" : f.costMXN} onChange={(e) => set("costMXN", Number(e.target.value) || 0)} placeholder="MXN — for Profits" /></div>
      {!limited && (
        <div className="sm:col-span-2"><span className={labelCls}>Customized activity (under this {KIND_LABEL[f.kind]})</span><input className={inputCls} value={f.customization} onChange={(e) => set("customization", e.target.value)} placeholder="e.g. Skip Valladolid, add private lunch (optional)" /></div>
      )}
      <div>
        <span className={labelCls}>Performed by</span>
        <input list="order-providers" className={inputCls} value={f.performedBy} onChange={(e) => set("performedBy", e.target.value)} placeholder="Guide / provider" />
        <datalist id="order-providers">{partners.filter((p) => p.provider).map((p) => <option key={p.name} value={p.name} />)}</datalist>
      </div>
      <div className="sm:col-span-2"><span className={labelCls}>Notes</span><input className={inputCls} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <div className="flex items-end">
        <button
          onClick={submit}
          disabled={busy || !f.customerName.trim() || (!limited && ((!f.catalogId && !f.title) || !f.date || !(f.totalMXN > 0)))}
          className="h-[42px] w-full rounded-full bg-forest px-5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
      {limited && <p className="text-[12px] text-sage lg:col-span-4">Website booking: what was booked and paid can&apos;t change here — refund or re-book through the payment provider if needed.</p>}
      {error && <p className="text-[12.5px] font-medium text-terracotta lg:col-span-4">{error}</p>}
    </div>
  );
}

function ManualOrderForm({ catalogs, partners }: { catalogs: Catalogs; partners: PartnerOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5 rounded-[18px] border border-sand bg-white p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
      >
        {open ? "− Close" : "+ Add a booking manually (phone / WhatsApp sale)"}
      </button>
      {open && (
        <OrderForm
          initial={BLANK}
          submitLabel="Add booking"
          catalogs={catalogs}
          partners={partners}
          onSubmit={async (f) => {
            const res = await createManualOrder(f);
            if (res.ok) window.location.reload(); // simplest way to show the fresh list
            return res;
          }}
        />
      )}
    </div>
  );
}

export default function OrdersClient({ initial, tourOptions, packageOptions, parkOptions, partners }: { initial: AdminOrder[]; tourOptions: CatalogOption[]; packageOptions: CatalogOption[]; parkOptions: CatalogOption[]; partners: PartnerOption[] }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const catalogs: Catalogs = { tour: tourOptions, package: packageOptions, park: parkOptions };

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    const prev = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await updateOrderStatus(id, status);
    if (!res.ok) {
      setOrders(prev);
      alert(res.error ?? "Could not update the order status.");
    }
    setBusy(null);
  };

  return (
    <>
      <PageHead
        eyebrow="Overview"
        title="Orders & Bookings"
        desc="Every booking, newest first — website checkouts and manually added sales. Update the status as you confirm and complete each booking."
      />
      <ManualOrderForm catalogs={catalogs} partners={partners} />

      {orders.length === 0 ? (
        <div className="rounded-[20px] border border-sand bg-white px-6 py-14 text-center">
          <p className="font-serif text-[22px] font-semibold text-ink">No bookings yet</p>
          <p className="mx-auto mt-2 max-w-[400px] text-[13.5px] leading-[1.7] text-sage">
            When a customer places an order at checkout, it appears here instantly with their
            contact details and everything they booked.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-[18px] border border-sand bg-white">
              <button
                onClick={() => setOpen(open === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left"
              >
                <span className="font-mono text-[13px] font-semibold text-ink">{o.id}</span>
                <span className="text-[12.5px] text-sage">{fmtDate(o.created_at)}</span>
                <span className="text-[13px] font-medium text-ink">{o.customer_name}</span>
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10.5px] font-bold text-forest">{orderType(o)}</span>
                {o.source === "manual" && <span className="rounded-full bg-sand px-2 py-0.5 text-[10.5px] font-bold text-sage">Manual</span>}
                {o.referrer && o.source !== "tutcasa" && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10.5px] font-bold text-[#8a6a1e]">via {o.referrer}</span>}
                <span className="hidden text-[12.5px] text-sage sm:inline">{o.customer_email}</span>
                <span className="ml-auto text-[13.5px] font-semibold text-ink">{fmtMXN(o.total)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[o.status] ?? "bg-sand text-sage"}`}
                >
                  {o.status}
                </span>
                <span className="text-sage">{open === o.id ? "▴" : "▾"}</span>
              </button>

              {open === o.id && (
                <div className="border-t border-sand px-5 py-4">
                  <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                    <div>
                      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[2px] text-terracotta">
                        Booked items
                      </div>
                      <div className="space-y-2.5">
                        {o.items.map((it) => (
                          <div key={it.id} className="rounded-xl bg-cream/60 p-3">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-[13.5px] font-semibold text-ink">
                                {it.title}
                                {it.subtitle ? (
                                  <span className="font-normal text-sage"> — {it.subtitle}</span>
                                ) : null}
                              </span>
                              <span className="text-[13px] font-medium text-ink">
                                {it.total > 0 ? fmtMXN(it.total) : "On request"}
                              </span>
                            </div>
                            <ul className="mt-1 space-y-0.5 text-[12px] leading-[1.6] text-sage">
                              {it.details.map((d) => (
                                <li key={d}>· {d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 space-y-1 text-[12.5px] text-sage">
                        <div>Subtotal: {fmtMXN(o.subtotal)}</div>
                        {o.discount > 0 && (
                          <div>
                            Discount: −{fmtMXN(o.discount)}
                            {o.promo_code ? ` (${o.promo_code}${o.discount_label ? ` — ${o.discount_label}` : ""})` : ""}
                          </div>
                        )}
                        <div className="font-semibold text-ink">Total: {fmtMXN(o.total)}</div>
                        <div>Payment method: {o.payment_method || "—"}</div>
                        <div>
                          Legal consent: {o.consent ? `✓ accepted${o.consent_at ? ` (${fmtDate(o.consent_at)})` : ""}` : "✗ missing"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[2px] text-terracotta">
                        Customer
                      </div>
                      <div className="space-y-1 text-[13px] text-ink">
                        <div>{o.customer_name}</div>
                        <div>
                          <a className="text-forest underline underline-offset-2" href={`mailto:${o.customer_email}`}>
                            {o.customer_email}
                          </a>
                        </div>
                        {o.customer_whatsapp && (
                          <div>
                            <a
                              className="text-forest underline underline-offset-2"
                              href={`https://wa.me/${o.customer_whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WhatsApp: {o.customer_whatsapp}
                            </a>
                          </div>
                        )}
                        {o.notes && (
                          <div className="mt-2 rounded-xl bg-cream/60 p-3 text-[12.5px] leading-[1.6] text-sage">
                            <span className="font-semibold text-ink">Notes:</span> {o.notes}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[2px] text-terracotta">
                          Status
                        </div>
                        <select
                          value={o.status}
                          disabled={busy === o.id}
                          onChange={(e) => setStatus(o.id, e.target.value)}
                          className="rounded-xl border-[1.5px] border-sand bg-white px-3 py-2 text-[13px] text-ink outline-none transition focus:border-forest disabled:opacity-60"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => setEditing(editing === o.id ? null : o.id)}
                        className="mt-4 rounded-full border-[1.5px] border-forest px-4 py-2 text-[12.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
                      >
                        {editing === o.id ? "Close edit" : "Edit booking"}
                      </button>
                    </div>
                  </div>
                  {editing === o.id && (
                    <div className="mt-4 rounded-xl border border-sand bg-cream/40 p-4">
                      <OrderForm
                        initial={fieldsFromOrder(o, partners)}
                        submitLabel="Save changes"
                        catalogs={catalogs}
                        partners={partners}
                        limited={o.source !== "manual" && o.source !== "tutcasa"}
                        onSubmit={async (f) => {
                          const res = await updateOrder(o.id, f);
                          if (res.ok) window.location.reload();
                          return res;
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { PageHead } from "../AdminUI";
import { createManualOrder, updateOrderStatus } from "./actions";
import { ORDER_STATUSES, type AdminOrder } from "./types";

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

function ManualOrderForm({ tourOptions, packageOptions }: { tourOptions: CatalogOption[]; packageOptions: CatalogOption[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({ kind: "tour" as "tour" | "package", catalogId: "", customerName: "", customerPhone: "", people: 2, date: "", totalMXN: 0, paymentMethod: "Cash" });
  const options = f.kind === "tour" ? tourOptions : packageOptions;
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const inputCls = "w-full rounded-xl border-[1.5px] border-sand bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-forest";
  const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest";

  const submit = async () => {
    if (busy) return;
    const title = options.find((o) => o.id === f.catalogId)?.name ?? "";
    setBusy(true);
    setError("");
    const res = await createManualOrder({ ...f, title });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
    window.location.reload(); // simplest way to show the fresh list
  };

  return (
    <div className="mb-5 rounded-[18px] border border-sand bg-white p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
      >
        {open ? "− Close" : "+ Add a booking manually (phone / WhatsApp sale)"}
      </button>
      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className={labelCls}>Type</span>
            <select className={inputCls} value={f.kind} onChange={(e) => setF((p) => ({ ...p, kind: e.target.value as "tour" | "package", catalogId: "" }))}>
              <option value="tour">Tour</option>
              <option value="package">Package</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>{f.kind === "tour" ? "Which tour" : "Which package"}</span>
            <select className={inputCls} value={f.catalogId} onChange={(e) => set("catalogId", e.target.value)}>
              <option value="">Choose…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div><span className={labelCls}>Customer name *</span><input className={inputCls} value={f.customerName} onChange={(e) => set("customerName", e.target.value)} /></div>
          <div><span className={labelCls}>Customer phone</span><input className={inputCls} value={f.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+1 ..." /></div>
          <div><span className={labelCls}>{f.kind === "tour" ? "Tour date *" : "Check-in *"}</span><input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div><span className={labelCls}>People</span><input type="number" min={1} className={inputCls} value={f.people === 0 ? "" : f.people} onChange={(e) => set("people", Number(e.target.value) || 1)} /></div>
          <div><span className={labelCls}>Total charged</span><input type="number" min={0} className={inputCls} value={f.totalMXN === 0 ? "" : f.totalMXN} onChange={(e) => set("totalMXN", Number(e.target.value) || 0)} placeholder="MXN" /></div>
          <div>
            <span className={labelCls}>Payment method</span>
            <select className={inputCls} value={f.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
              {["Cash", "Card", "Bank transfer", "PayPal", "Other"].map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={submit}
              disabled={busy || !f.customerName.trim() || !f.catalogId || !f.date || !(f.totalMXN > 0)}
              className="h-[42px] w-full rounded-full bg-forest px-5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {busy ? "Saving…" : "Add booking"}
            </button>
          </div>
          {error && <p className="text-[12.5px] font-medium text-terracotta lg:col-span-4">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function OrdersClient({ initial, tourOptions, packageOptions }: { initial: AdminOrder[]; tourOptions: CatalogOption[]; packageOptions: CatalogOption[] }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
      <ManualOrderForm tourOptions={tourOptions} packageOptions={packageOptions} />

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
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

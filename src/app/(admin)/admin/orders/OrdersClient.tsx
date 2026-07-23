"use client";

import { useState } from "react";
import { PageHead } from "../AdminUI";
import { updateOrderStatus } from "./actions";
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
  "Paid (test mode)": "bg-forest/15 text-forest",
  Confirmed: "bg-forest/10 text-forest",
  Completed: "bg-forest/15 text-forest",
  Cancelled: "bg-terracotta/10 text-terracotta",
};

export default function OrdersClient({ initial }: { initial: AdminOrder[] }) {
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
        desc="Every booking placed on your website, newest first. Update the status as you confirm and complete each booking — customers see payments and confirmations by WhatsApp/email for now."
      />

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

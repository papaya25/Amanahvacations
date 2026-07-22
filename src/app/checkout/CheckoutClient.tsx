"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmtMXN, fmtUSD, useCart } from "@/lib/cart";
import { newOrderId, saveOrder } from "@/lib/orders";

/* Demo promo codes for the flow-first build. Real validation moves to the
   backend (Stripe coupons or a Supabase promo table) when payments are wired. */
const PROMOS: Record<string, { type: "pct" | "flat"; value: number; label: string }> = {
  AMANAH10: { type: "pct", value: 10, label: "10% off" },
  WELCOME500: { type: "flat", value: 500, label: "$500 MXN off" },
};

const PAYMENT_METHODS = [
  { id: "stripe", name: "Credit / Debit Card", note: "Visa, Mastercard, Amex · via Stripe (also OXXO & SPEI)", badge: "Secure" },
  { id: "paypal", name: "PayPal", note: "Pay with your PayPal balance or linked card", badge: "" },
  { id: "mercadopago", name: "Mercado Pago", note: "Cards, cash & transfers popular in Mexico", badge: "" },
];

export default function CheckoutClient() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("stripe");

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; label: string; amount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [placing, setPlacing] = useState(false);

  const discount = promo?.amount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const validContact = name.trim() && /.+@.+\..+/.test(email);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError("");
    if (!code) return;
    const def = PROMOS[code];
    if (!def) {
      setPromo(null);
      setPromoError("That code isn't valid. Try AMANAH10 or WELCOME500.");
      return;
    }
    const amount =
      def.type === "pct" ? Math.round((subtotal * def.value) / 100) : Math.min(def.value, subtotal);
    setPromo({ code, label: def.label, amount });
  };

  const placeOrder = () => {
    if (!validContact || items.length === 0) return;
    setPlacing(true);
    const id = newOrderId();
    saveOrder({
      id,
      date: new Date().toISOString(),
      items,
      subtotal,
      discount,
      discountLabel: promo?.label,
      promo: promo?.code,
      total,
      paymentMethod: PAYMENT_METHODS.find((m) => m.id === payment)?.name ?? payment,
      contact: { name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim() },
      status: "Pending confirmation",
    });
    clear();
    router.push(`/thank-you?id=${id}`);
  };

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest";

  if (ready && items.length === 0) {
    return (
      <div className="rounded-[22px] border border-sand bg-white px-6 py-16 text-center">
        <p className="font-serif text-[24px] font-semibold text-ink">Nothing to check out yet</p>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-[1.7] text-sage">
          Add a package or tour to your cart first, then come back to complete your booking.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/packages" className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white">
            Browse Packages →
          </Link>
          <Link href="/tours" className="rounded-full border-[1.5px] border-forest px-6 py-3 text-[14px] font-medium text-forest">
            Browse Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-[clamp(24px,3vw,44px)] lg:grid-cols-[1.5fr_1fr]">
      {/* LEFT — forms */}
      <div className="space-y-6">
        {/* Contact */}
        <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-[22px] font-semibold text-ink">Your details</h2>
            <Link href="/login" className="text-[12.5px] font-medium text-forest underline underline-offset-2">
              Log in for faster checkout
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="co-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Full name *</label>
              <input id="co-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="co-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Email *</label>
              <input id="co-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-wa" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">WhatsApp</label>
              <input id="co-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} placeholder="+1 ..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-notes" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">Notes for our team</label>
              <textarea id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-y`} placeholder="Flight times, dietary needs, a special occasion..." />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
          <h2 className="mb-1 font-serif text-[22px] font-semibold text-ink">Payment method</h2>
          <p className="mb-4 text-[12.5px] text-sage">
            Choose how you&apos;d like to pay. Your booking is confirmed once payment is received.
          </p>
          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-4 transition ${
                  payment === m.id ? "border-forest bg-forest/[0.04]" : "border-sand hover:border-forest/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === m.id}
                  onChange={() => setPayment(m.id)}
                  className="h-4 w-4 accent-forest"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-ink">{m.name}</span>
                    {m.badge && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-forest">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-sage">{m.note}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-[11.5px] leading-[1.6] text-sage">
            <strong className="text-forest">Preview mode:</strong> no real charge is made yet. Live
            card, PayPal and Mercado Pago payment will be connected before launch.
          </p>
        </section>
      </div>

      {/* RIGHT — summary + promo */}
      <aside className="h-fit space-y-5 lg:sticky lg:top-[108px]">
        <section className="rounded-[20px] border border-sand bg-white p-6">
          <h2 className="mb-4 font-serif text-[22px] font-semibold text-ink">Order summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-sand pb-3 last:border-0 last:pb-0">
                {item.image && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold leading-tight text-ink">{item.title}</div>
                  <div className="truncate text-[11.5px] text-sage">{item.details[0]}</div>
                </div>
                <div className="shrink-0 text-[13px] font-semibold text-ink">{fmtMXN(item.total)}</div>
              </div>
            ))}
          </div>

          {/* Promo */}
          <div className="mt-4 border-t border-sand pt-4">
            <label htmlFor="promo" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                id="promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter code"
                className={`${inputCls} flex-1 uppercase`}
              />
              <button
                onClick={applyPromo}
                className="shrink-0 rounded-xl border-[1.5px] border-forest px-4 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="mt-1.5 text-[12px] text-terracotta">{promoError}</p>}
            {promo && (
              <p className="mt-1.5 flex items-center justify-between text-[12.5px] text-forest">
                <span>
                  ✓ <strong>{promo.code}</strong> — {promo.label}
                </span>
                <button
                  onClick={() => {
                    setPromo(null);
                    setPromoInput("");
                  }}
                  className="text-sage underline underline-offset-2"
                >
                  Remove
                </button>
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 border-t border-sand pt-4 text-[14px]">
            <div className="flex justify-between text-sage">
              <span>Subtotal</span>
              <span className="font-medium text-ink">{fmtMXN(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Discount ({promo?.label})</span>
                <span>−{fmtMXN(discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-serif text-[18px] font-semibold text-ink">Total</span>
              <div className="text-right">
                <div className="font-serif text-[26px] font-bold text-forest">{fmtMXN(total)}</div>
                <div className="text-[11px] text-sage">{fmtUSD(total)}</div>
              </div>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={!validContact || placing}
            className="mt-5 w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3.5 text-center text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {placing ? "Placing order…" : "Place Order →"}
          </button>
          {!validContact && (
            <p className="mt-2 text-center text-[11.5px] text-sage">
              Enter your name and email to continue.
            </p>
          )}
        </section>
        <div className="flex items-center justify-center gap-2 text-[11.5px] text-sage">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Secure checkout · your details are never shared
        </div>
      </aside>
    </div>
  );
}

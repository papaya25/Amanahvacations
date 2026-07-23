"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { saveOrder } from "@/lib/orders";
import { placeOrder as placeOrderAction } from "./actions";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

import { validatePromo } from "@/lib/content/promo-actions";

/* Payment identity is fixed in English: `id` drives server routing and `name`
   is the human-readable label stored with the order (kept English so the admin
   dashboard is consistent). Display labels are translated separately below. */
const PAYMENT_METHODS = [
  { id: "stripe", name: "Credit / Debit Card", badge: "Secure" },
  { id: "paypal", name: "PayPal", badge: "" },
  { id: "mercadopago", name: "Mercado Pago", badge: "" },
];

export default function CheckoutClient({
  transferEnabled = true,
  initialName = "",
  initialEmail = "",
}: {
  transferEnabled?: boolean;
  initialName?: string;
  initialEmail?: string;
}) {
  const { items, subtotal, clear, ready } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const { locale, dict } = useI18n();
  const L = (href: string) => localizeHref(href, locale);
  // Translated display labels for the fixed payment methods (name shown to the
  // visitor; the English name above is what gets stored with the order).
  const paymentDisplay: Record<string, { name: string; note: string }> = {
    stripe: { name: dict.pay_stripe_name, note: dict.pay_stripe_note },
    paypal: { name: "PayPal", note: dict.pay_paypal_note },
    mercadopago: { name: "Mercado Pago", note: dict.pay_mp_note },
  };

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("stripe");

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; label: string; amount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [transfer, setTransfer] = useState(false);
  const [flightInfo, setFlightInfo] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const discount = promo?.amount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const emailValid = /.+@.+\..+/.test(email);
  const validContact = name.trim() && emailValid;
  const canPlace = Boolean(validContact) && agreed && items.length > 0;

  // Field-level warnings appear once the visitor has interacted with a field,
  // so they see exactly what's missing or incomplete.
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});
  const touch = (k: "name" | "email") => setTouched((t) => ({ ...t, [k]: true }));
  const nameError = touched.name && !name.trim() ? dict.co_name_err : null;
  const emailError =
    touched.email && !emailValid
      ? email.trim()
        ? dict.co_email_err_incomplete
        : dict.co_email_err_missing
      : null;

  const [checkingPromo, setCheckingPromo] = useState(false);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    setPromoError("");
    if (!code || checkingPromo) return;
    setCheckingPromo(true);
    const def = await validatePromo(code); // validated on the server
    setCheckingPromo(false);
    if (!def) {
      setPromo(null);
      setPromoError(dict.co_promo_invalid);
      return;
    }
    const amount =
      def.type === "pct" ? Math.round((subtotal * def.value) / 100) : Math.min(def.value, subtotal);
    setPromo({ code, label: def.label, amount });
  };

  const placeOrder = async () => {
    if (!canPlace || placing) return;
    setPlacing(true);
    setPlaceError(null);
    const orderItems = transfer
      ? [
          ...items,
          {
            id: `transfer-${Date.now()}`,
            kind: "activity" as const,
            title: "Private Airport Transfer",
            details: [
              "Cancún Airport ↔ your accommodation",
              flightInfo.trim() ? `Flight: ${flightInfo.trim()}` : "Flight details to be confirmed",
              "Price confirmed by our team (not charged now)",
            ],
            total: 0,
            people: items[0]?.people ?? 1,
          },
        ]
      : items;

    const paymentName = PAYMENT_METHODS.find((m) => m.id === payment)?.name ?? payment;
    // The server stores the order (and recomputes the discount); the local copy
    // keeps the thank-you and account pages working for guests.
    const res = await placeOrderAction({
      items: orderItems,
      promoCode: promo?.code,
      paymentMethodId: payment,
      paymentMethod: paymentName,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || undefined,
      notes: notes.trim() || undefined,
      consent: agreed,
    });
    if (!res.ok) {
      setPlacing(false);
      setPlaceError(res.error);
      return;
    }
    saveOrder({
      id: res.id,
      date: new Date().toISOString(),
      items: orderItems,
      subtotal: res.subtotal,
      discount: res.discount,
      discountLabel: res.discountLabel,
      promo: promo?.code,
      total: res.total,
      paymentMethod: paymentName,
      contact: { name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim() },
      status: res.checkoutUrl ? "Pending payment" : "Pending confirmation",
    });
    clear();
    if (res.checkoutUrl) {
      // Off to Stripe's secure page; it returns to /thank-you after payment.
      window.location.href = res.checkoutUrl;
      return;
    }
    router.push(L(`/thank-you?id=${res.id}`));
  };

  const inputCls =
    "w-full rounded-xl border-[1.5px] border-sand bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-forest";

  if (ready && items.length === 0) {
    return (
      <div className="rounded-[22px] border border-sand bg-white px-6 py-16 text-center">
        <p className="font-serif text-[24px] font-semibold text-ink">{dict.co_empty_title}</p>
        <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-[1.7] text-sage">
          {dict.co_empty_desc}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={L("/packages")} className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white">
            {dict.cart_browse_packages}
          </Link>
          <Link href={L("/tours")} className="rounded-full border-[1.5px] border-forest px-6 py-3 text-[14px] font-medium text-forest">
            {dict.cart_browse_tours}
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
            <h2 className="font-serif text-[22px] font-semibold text-ink">{dict.co_your_details}</h2>
            <Link href={L("/login")} className="text-[12.5px] font-medium text-forest underline underline-offset-2">
              {dict.co_login_faster}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="co-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.co_full_name}</label>
              <input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => touch("name")}
                aria-invalid={Boolean(nameError)}
                className={inputCls}
              />
              {nameError && <p className="mt-1.5 text-[12px] font-medium text-terracotta">{nameError}</p>}
            </div>
            <div>
              <label htmlFor="co-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.co_email}</label>
              <input
                id="co-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch("email")}
                aria-invalid={Boolean(emailError)}
                className={inputCls}
              />
              {emailError && <p className="mt-1.5 text-[12px] font-medium text-terracotta">{emailError}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-wa" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.co_whatsapp}</label>
              <input id="co-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} placeholder="+1 ..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-notes" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">{dict.co_notes}</label>
              <textarea id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-y`} placeholder={dict.co_notes_ph} />
            </div>
          </div>
        </section>

        {/* Airport transfer add-on (admin can disable in /admin/transfers) */}
        {transferEnabled && (
        <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={transfer}
              onChange={(e) => setTransfer(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-forest"
            />
            <span>
              <span className="block font-serif text-[19px] font-semibold text-ink">
                {dict.co_add_transfer_title}
              </span>
              <span className="mt-1 block text-[12.5px] leading-[1.65] text-sage">
                {dict.co_add_transfer_desc}{" "}
                <Link href={L("/airport-transfers")} target="_blank" className="font-medium text-forest underline underline-offset-2">
                  {dict.co_learn_more}
                </Link>
              </span>
            </span>
          </label>
          {transfer && (
            <div className="mt-4">
              <label htmlFor="co-flight" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                {dict.co_flight_label}
              </label>
              <input
                id="co-flight"
                value={flightInfo}
                onChange={(e) => setFlightInfo(e.target.value)}
                className={inputCls}
                placeholder={dict.co_flight_ph}
              />
            </div>
          )}
        </section>
        )}

        {/* Payment */}
        <section className="rounded-[20px] border border-sand bg-white p-[clamp(20px,2.5vw,32px)]">
          <h2 className="mb-1 font-serif text-[22px] font-semibold text-ink">{dict.co_payment_method}</h2>
          <p className="mb-4 text-[12.5px] text-sage">
            {dict.co_payment_desc}
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
                    <span className="text-[14px] font-semibold text-ink">{paymentDisplay[m.id]?.name ?? m.name}</span>
                    {m.badge && (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-forest">
                        {dict.pay_secure_badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-sage">{paymentDisplay[m.id]?.note ?? ""}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-[11.5px] leading-[1.6] text-sage">
            <strong className="text-forest">{dict.co_preview_strong}</strong> {dict.co_preview_rest}
          </p>
        </section>
      </div>

      {/* RIGHT — summary + promo */}
      <aside className="h-fit space-y-5 lg:sticky lg:top-[108px]">
        <section className="rounded-[20px] border border-sand bg-white p-6">
          <h2 className="mb-4 font-serif text-[22px] font-semibold text-ink">{dict.co_order_summary}</h2>
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
                <div className="shrink-0 text-[13px] font-semibold text-ink">{format(item.total)}</div>
              </div>
            ))}
          </div>

          {/* Promo */}
          <div className="mt-4 border-t border-sand pt-4">
            <label htmlFor="promo" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
              {dict.co_promo_code}
            </label>
            <div className="flex gap-2">
              <input
                id="promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder={dict.co_promo_ph}
                className={`${inputCls} flex-1 uppercase`}
              />
              <button
                onClick={applyPromo}
                className="shrink-0 rounded-xl border-[1.5px] border-forest px-4 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
              >
                {dict.co_apply}
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
                  {dict.co_remove}
                </button>
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 border-t border-sand pt-4 text-[14px]">
            <div className="flex justify-between text-sage">
              <span>{dict.co_subtotal}</span>
              <span className="font-medium text-ink">{format(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>{dict.co_discount} ({promo?.label})</span>
                <span>−{format(discount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-serif text-[18px] font-semibold text-ink">{dict.co_total}</span>
              <div className="text-right">
                <div className="font-serif text-[26px] font-bold text-forest">{format(total)}</div>
              </div>
            </div>
          </div>

          {/* Legal consent — required before payment */}
          <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-cream px-4 py-3.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
            />
            <span className="text-[12px] leading-[1.6] text-ink/80">
              {dict.co_consent_pre}{" "}
              <a href={L("/terms-and-conditions")} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline underline-offset-2">
                {dict.footer_terms}
              </a>
              {dict.co_consent_mid1}{" "}
              <a href={L("/liability-waiver")} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline underline-offset-2">
                {dict.footer_waiver}
              </a>
              {dict.co_consent_mid2}{" "}
              <a href={L("/privacy-policy")} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest underline underline-offset-2">
                {dict.footer_privacy}
              </a>
              {dict.co_consent_post}
            </span>
          </label>

          <button
            onClick={placeOrder}
            disabled={!canPlace || placing}
            className="mt-4 w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3.5 text-center text-[14px] font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {placing ? dict.co_placing : dict.co_place_order}
          </button>
          {placeError && (
            <p className="mt-2 text-center text-[12.5px] font-medium text-terracotta">{placeError}</p>
          )}
          {!validContact ? (
            <p className="mt-2 text-center text-[11.5px] text-sage">
              {dict.co_enter_name_email}
            </p>
          ) : !agreed ? (
            <p className="mt-2 text-center text-[11.5px] text-sage">
              {dict.co_accept_terms}
            </p>
          ) : null}
        </section>
        <div className="flex items-center justify-center gap-2 text-[11.5px] text-sage">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          {dict.co_secure}
        </div>
      </aside>
    </div>
  );
}

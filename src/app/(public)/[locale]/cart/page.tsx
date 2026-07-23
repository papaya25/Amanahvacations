"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

export default function CartPage() {
  const { items, subtotal, remove, ready } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const { locale, dict } = useI18n();
  const L = (href: string) => localizeHref(href, locale);

  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[1100px] px-5 py-[clamp(32px,4vw,64px)] lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            {dict.cart_eyebrow}
          </div>
          <h1 className="font-serif text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            {dict.cart_title_1} <em className="italic text-forest">{dict.cart_title_em}</em>
          </h1>
        </div>

        {ready && items.length === 0 ? (
          <div className="rounded-[22px] border border-sand bg-white px-6 py-16 text-center">
            <p className="font-serif text-[24px] font-semibold text-ink">{dict.cart_empty_title}</p>
            <p className="mx-auto mt-2 max-w-[380px] text-[14px] leading-[1.7] text-sage">
              {dict.cart_empty_desc}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={L("/packages")}
                className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
              >
                {dict.cart_browse_packages}
              </Link>
              <Link
                href={L("/tours")}
                className="rounded-full border-[1.5px] border-forest px-6 py-3 text-[14px] font-medium text-forest transition hover:bg-forest hover:text-white"
              >
                {dict.cart_browse_tours}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-[18px] border border-sand bg-white p-4"
                >
                  {item.image && (
                    <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[12px]">
                      <Image src={item.image} alt="" fill sizes="92px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[2px] text-terracotta">
                          {item.kind}
                        </span>
                        <h2 className="font-serif text-[19px] font-semibold leading-tight text-ink">
                          {item.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        aria-label={`${dict.cart_remove} ${item.title}`}
                        className="shrink-0 text-[12px] font-medium text-sage underline underline-offset-2 transition hover:text-terracotta"
                      >
                        {dict.cart_remove}
                      </button>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[12.5px] leading-[1.5] text-sage">
                      {item.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <div className="mt-2 font-serif text-[18px] font-semibold text-forest">
                      {format(item.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-[20px] border border-sand bg-white p-6 lg:sticky lg:top-[108px]">
              <h2 className="mb-4 font-serif text-[22px] font-semibold text-ink">{dict.cart_summary}</h2>
              <div className="flex items-center justify-between border-b border-sand pb-3 text-[14px]">
                <span className="text-sage">{dict.cart_subtotal}</span>
                <span className="font-semibold text-ink">{format(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-serif text-[18px] font-semibold text-ink">{dict.cart_total}</span>
                <div className="text-right">
                  <div className="font-serif text-[24px] font-bold text-forest">{format(subtotal)}</div>
                </div>
              </div>
              <p className="mt-2 text-[11.5px] leading-[1.6] text-sage">
                {dict.cart_note}
              </p>
              <button
                onClick={() => router.push(L("/checkout"))}
                className="mt-5 w-full rounded-full bg-gradient-to-br from-terracotta to-gold py-3.5 text-center text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
              >
                {dict.cart_checkout}
              </button>
              <Link
                href={L("/packages")}
                className="mt-3 block text-center text-[13px] font-medium text-forest underline underline-offset-2"
              >
                {dict.cart_continue}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

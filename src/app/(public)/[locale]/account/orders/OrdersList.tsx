"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/currency";
import type { CartItem } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

export type AccountOrder = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  "Paid (test mode)": "bg-forest/15 text-forest",
  Confirmed: "bg-forest/10 text-forest",
  Completed: "bg-forest/15 text-forest",
  Cancelled: "bg-terracotta/10 text-terracotta",
};

export default function OrdersList({ orders }: { orders: AccountOrder[] }) {
  const { format } = useCurrency();
  const { locale, dict } = useI18n();
  const dateLocale = locale === "en" ? "en-US" : locale;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });

  if (orders.length === 0) {
    return (
      <div className="rounded-[20px] border border-sand bg-white px-6 py-14 text-center">
        <p className="font-serif text-[22px] font-semibold text-ink">{dict.ord_empty_title}</p>
        <p className="mx-auto mt-2 max-w-[360px] text-[13.5px] leading-[1.7] text-sage">
          {dict.ord_empty_desc}
        </p>
        <Link
          href={localizeHref("/packages", locale)}
          className="mt-6 inline-block rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5"
        >
          {dict.ord_start_planning}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-[18px] border border-sand bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand pb-3">
            <div>
              <span className="font-serif text-[18px] font-semibold text-ink">{o.id}</span>
              <span className="ml-3 text-[12.5px] text-sage">{fmtDate(o.date)}</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[o.status] ?? "bg-gold/15 text-[#8a6a1e]"}`}
            >
              {o.status}
            </span>
          </div>
          <div className="space-y-2.5 py-3">
            {o.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-[13.5px]">
                <div>
                  <div className="font-semibold text-ink">{item.title}</div>
                  <div className="text-[12px] text-sage">{item.details.join(" · ")}</div>
                </div>
                <div className="shrink-0 font-semibold text-ink">
                  {item.total > 0 ? format(item.total) : dict.ord_on_request}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-sand pt-3">
            <span className="text-[12.5px] text-sage">{o.paymentMethod}</span>
            <span className="font-serif text-[18px] font-bold text-forest">{dict.ord_total} {format(o.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

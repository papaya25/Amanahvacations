"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fmtMXN, fmtUSD } from "@/lib/cart";
import { getOrder, type Order } from "@/lib/orders";

export default function ThankYouClient() {
  const params = useSearchParams();
  const id = params.get("id");
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(id ? getOrder(id) ?? null : null);
  }, [id]);

  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[720px] px-5 py-[clamp(40px,5vw,80px)] lg:px-8">
        <div className="rounded-[24px] border border-sand bg-white p-[clamp(24px,3vw,44px)] text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3A5A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            Booking Received
          </div>
          <h1 className="font-serif text-[clamp(30px,4vw,46px)] font-semibold leading-[1.05] tracking-[-1px] text-ink">
            Thank you{order?.contact.name ? `, ${order.contact.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[14px] leading-[1.75] text-sage">
            Your request is in. Our team will confirm availability and the final details with you
            shortly — usually within a few hours — via WhatsApp or email.
          </p>

          {order && (
            <div className="mt-8 rounded-[18px] bg-cream p-6 text-left">
              <div className="flex items-center justify-between border-b border-sand pb-3">
                <span className="text-[12px] uppercase tracking-[1.5px] text-sage">Order</span>
                <span className="font-serif text-[18px] font-semibold text-ink">{order.id}</span>
              </div>
              <div className="space-y-3 py-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-[13.5px]">
                    <div>
                      <div className="font-semibold text-ink">{item.title}</div>
                      <div className="text-[12px] text-sage">{item.details.join(" · ")}</div>
                    </div>
                    <div className="shrink-0 font-semibold text-ink">{fmtMXN(item.total)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 border-t border-sand pt-3 text-[13.5px]">
                <div className="flex justify-between text-sage">
                  <span>Subtotal</span>
                  <span className="text-ink">{fmtMXN(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-forest">
                    <span>Discount{order.promo ? ` (${order.promo})` : ""}</span>
                    <span>−{fmtMXN(order.discount)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-1.5">
                  <span className="font-serif text-[17px] font-semibold text-ink">Total</span>
                  <div className="text-right">
                    <div className="font-serif text-[22px] font-bold text-forest">{fmtMXN(order.total)}</div>
                    <div className="text-[11px] text-sage">{fmtUSD(order.total)}</div>
                  </div>
                </div>
                <div className="flex justify-between pt-2 text-[12.5px] text-sage">
                  <span>Payment</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          )}

          {order === null && (
            <p className="mt-6 text-[13px] text-sage">
              We couldn&apos;t find that order reference, but if you completed checkout, our team
              already has your request.
            </p>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              View My Orders →
            </Link>
            <Link
              href="/"
              className="rounded-full border-[1.5px] border-forest px-6 py-3 text-[14px] font-medium text-forest transition hover:bg-forest hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

/* Slide-in cart drawer — lets the visitor review their trip WITHOUT leaving
   the page they're planning on (built for the packages configurator; reusable
   anywhere under the cart/currency/i18n providers). Self-contained styles in
   side-cart.css (sc- prefix). */

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";
import "./side-cart.css";

export default function SideCart({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, remove } = useCart();
  const { format } = useCurrency();
  const { locale, dict } = useI18n();

  return (
    <div
      className={`sc-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <aside className="sc-drawer" role="dialog" aria-label={dict.sc_title}>
        <div className="sc-head">
          <span className="sc-title">{dict.sc_title}</span>
          <button className="sc-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="sc-items">
          {items.length === 0 ? (
            <p className="sc-empty">{dict.sc_empty}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="sc-item">
                {item.image && (
                  <div className="sc-item-img">
                    <Image src={item.image} alt="" fill sizes="52px" className="sc-img" />
                  </div>
                )}
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.title}</div>
                  {item.details[0] && <div className="sc-item-sub">{item.details[0]}</div>}
                </div>
                <div className="sc-item-right">
                  <div className="sc-item-price">{format(item.total)}</div>
                  <button className="sc-item-remove" onClick={() => remove(item.id)}>
                    {dict.co_remove}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sc-foot">
          <div className="sc-subtotal">
            <span>{dict.co_subtotal}</span>
            <strong>{format(subtotal)}</strong>
          </div>
          <Link
            href={localizeHref("/checkout", locale)}
            className={`sc-checkout${items.length === 0 ? " disabled" : ""}`}
            onClick={(e) => {
              if (items.length === 0) e.preventDefault();
            }}
          >
            {dict.sc_checkout}
          </Link>
          <button className="sc-continue" onClick={onClose}>
            {dict.sc_continue}
          </button>
        </div>
      </aside>
    </div>
  );
}

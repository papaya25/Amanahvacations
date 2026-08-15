"use client";

/* Inline TutCasa partner-homes panel, shown when the guest picks the
   "Airbnb / Villa" accommodation tier. Everything happens on this page:
   the catalog loads lazily into a scrollable card row, a tapped card expands
   in place with full details and a LIVE quote for the trip dates already
   chosen in the configurator. Only the final booking leaves the site —
   in a new tab, deep-linked to the same home/dates on TutCasa. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";
import { fetchTutcasaHomes, fetchTutcasaQuote } from "./tutcasa-actions";
import type { TutcasaListing, TutcasaQuote } from "@/lib/tutcasa";

export type ChosenHome = { slug: string; title: string };

const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString("en-US")} USD`;

const fmtDate = (v: string) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "";

/* Neutral line-art placeholder until TutCasa's photo import lands. */
function PhotoFallback() {
  return (
    <div className="tc-photo tc-photo-fallback" aria-hidden>
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9.5h13V10" />
        <path d="M10 19.5v-5h4v5" />
      </svg>
      <span>TutCasa</span>
    </div>
  );
}

export default function TutcasaHomes({
  checkin,
  checkout,
  guests,
  chosen,
  onChoose,
}: {
  checkin: string;
  checkout: string;
  guests: number;
  chosen: ChosenHome | null;
  onChoose: (h: ChosenHome | null) => void;
}) {
  const { locale, dict } = useI18n();
  const { add, items } = useCart();
  const { rateUSD } = useCurrency();
  const [homes, setHomes] = useState<TutcasaListing[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [quote, setQuote] = useState<TutcasaQuote | "loading" | null>(null);

  // A stay for this home + these exact dates already sits in the cart.
  const inCart = (slug: string) =>
    items.some(
      (i) => i.kind === "stay" && i.meta?.stay_slug === slug && i.meta?.ci === checkin && i.meta?.co === checkout
    );

  // Lazy catalog load — this component only mounts once the tier is picked.
  useEffect(() => {
    let alive = true;
    fetchTutcasaHomes().then((h) => alive && setHomes(h));
    return () => {
      alive = false;
    };
  }, []);

  // Live quote for the expanded home whenever the trip inputs change.
  useEffect(() => {
    if (!open || !checkin || !checkout) {
      setQuote(null);
      return;
    }
    let alive = true;
    setQuote("loading");
    fetchTutcasaQuote(open, checkin, checkout, guests).then((q) => alive && setQuote(q));
    return () => {
      alive = false;
    };
  }, [open, checkin, checkout, guests]);

  if (homes !== null && homes.length === 0) {
    return <div className="tc-panel tc-empty">{dict.tc_none}</div>;
  }

  const openHome = homes?.find((h) => h.slug === open) ?? null;

  /* Put the stay in the cart as its own paid line. The MXN total shown is the
     TutCasa USD quote at the site's configured rate — display only; checkout
     re-derives the real amount from a fresh TutCasa hold. */
  const addStay = (h: TutcasaListing, q: Extract<TutcasaQuote, { ok: true }>) => {
    add({
      kind: "stay",
      title: h.title,
      subtitle: `${h.city} · ${h.propertyType}`,
      image: h.photos[0]?.url,
      details: [
        `${fmtDate(checkin)} → ${fmtDate(checkout)}`,
        `${q.nights} ${dict.tc_quote_nights} · ${Math.max(1, guests)} ${dict.tc_guests}`,
        "TutCasa",
      ],
      total: Math.round(q.total * rateUSD),
      people: Math.max(1, guests),
      meta: {
        stay_slug: h.slug,
        ci: checkin,
        co: checkout,
        guests: String(Math.max(1, guests)),
        usd_total: String(q.total),
        currency: "MXN",
      },
    });
    onChoose({ slug: h.slug, title: h.title });
  };

  return (
    <div className="tc-panel">
      <div className="tc-partner-line">{dict.tc_partner_line}</div>

      {homes === null ? (
        <div className="tc-loading">{dict.tc_loading}</div>
      ) : (
        <>
          <div className="tc-row">
            {homes.map((h) => {
              const isOpen = open === h.slug;
              const isChosen = chosen?.slug === h.slug;
              return (
                <div key={h.slug} className={`tc-card${isChosen ? " chosen" : ""}${isOpen ? " open" : ""}`}>
                  {h.photos[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tc-photo" src={h.photos[0].url} alt={h.photos[0].alt || h.title} />
                  ) : (
                    <PhotoFallback />
                  )}
                  <div className="tc-card-body">
                    <div className="tc-card-top">
                      <span className="tc-title">{h.title}</span>
                      {h.rating != null && (
                        <span className="tc-rating">★ {h.rating}</span>
                      )}
                    </div>
                    <div className="tc-city">
                      {h.city} · {h.propertyType}
                    </div>
                    <div className="tc-specs">
                      {dict.tc_up_to} {h.maxGuests} {dict.tc_guests} · {h.bedrooms} {dict.tc_bedrooms} · {h.bathrooms} {dict.tc_bathrooms}
                    </div>
                    <div className="tc-price-line">
                      <span className="tc-from">{dict.tc_from}</span>{" "}
                      <span className="tc-price">{fmtUsd(h.pricing.allInNightly)}</span>
                      <span className="tc-per">{dict.tc_night_allin}</span>
                    </div>
                    <button
                      className="tc-view-btn"
                      onClick={() => setOpen(isOpen ? null : h.slug)}
                    >
                      {isOpen ? dict.tc_hide : dict.tc_view}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {openHome && (
            <div className="tc-detail">
              <div className="tc-detail-head">
                <div>
                  <div className="tc-detail-title">{openHome.title}</div>
                  <div className="tc-detail-tag">{openHome.headline}</div>
                </div>
                <span className={`tc-book-mode${openHome.instantBook ? " instant" : ""}`}>
                  {openHome.instantBook ? dict.tc_instant : dict.tc_request}
                </span>
              </div>

              <p className="tc-desc">{openHome.description}</p>

              {openHome.amenities.length > 0 && (
                <div className="tc-amenities">
                  {openHome.amenities.map((a) => (
                    <span key={a} className="tc-amenity">{a}</span>
                  ))}
                </div>
              )}

              <div className="tc-meta-line">
                {dict.tc_min_stay} {openHome.minStay} {dict.tc_nights_min} · {dict.tc_checkin_from} {openHome.checkinFrom} · {dict.tc_checkout_until} {openHome.checkoutUntil}
                {openHome.reviewCount > 0 && <> · ★ {openHome.rating} ({openHome.reviewCount} {dict.tc_reviews})</>}
              </div>

              {guests > openHome.maxGuests && (
                <div className="tc-warn">{dict.tc_too_small}</div>
              )}

              {/* Live all-in quote for the dates picked above */}
              <div className="tc-quote">
                {!checkin || !checkout ? (
                  <span className="tc-quote-hint">{dict.tc_pick_dates}</span>
                ) : quote === "loading" ? (
                  <span className="tc-quote-hint">{dict.tc_loading}</span>
                ) : quote && quote.ok ? (
                  <>
                    <div className="tc-quote-main">
                      <span className="tc-quote-label">
                        {dict.tc_quote_total} · {quote.nights} {dict.tc_quote_nights}
                      </span>
                      <span className="tc-quote-total">{fmtUsd(quote.total)}</span>
                    </div>
                    <div className="tc-quote-sub">
                      {fmtUsd(quote.dueNow)} {dict.tc_quote_due} · {fmtUsd(quote.securityDeposit)} {dict.tc_quote_deposit}
                    </div>
                  </>
                ) : quote && !quote.ok ? (
                  <span className="tc-quote-warn">
                    {quote.error === "DATES_TAKEN"
                      ? dict.tc_quote_taken
                      : quote.error === "MIN_STAY_NOT_MET"
                        ? dict.tc_quote_minstay
                        : dict.tc_pick_dates}
                  </span>
                ) : (
                  <span className="tc-quote-hint">{dict.tc_pick_dates}</span>
                )}
              </div>

              <div className="tc-actions">
                {/* Booking requires trip dates AND a live quote confirming the
                    home is available for them — the button stays locked (and
                    explains why via the quote box above) until both hold. */}
                {(() => {
                  const added = inCart(openHome.slug);
                  const quoteOk = quote !== null && quote !== "loading" && quote.ok;
                  const canAdd =
                    !added && Boolean(checkin && checkout) && quoteOk && guests <= openHome.maxGuests;
                  if (added) {
                    return (
                      <>
                        <button className="tc-choose-btn chosen" disabled>
                          ✓ {dict.tc_added}
                        </button>
                        <Link className="tc-book-btn" href={localizeHref("/cart", locale)}>
                          {dict.tc_view_cart}
                        </Link>
                      </>
                    );
                  }
                  return (
                    <button
                      className="tc-book-btn tc-book-cta"
                      disabled={!canAdd}
                      title={!canAdd ? dict.tc_pick_dates : undefined}
                      onClick={() => {
                        if (quote !== null && quote !== "loading" && quote.ok) addStay(openHome, quote);
                      }}
                    >
                      {dict.tc_add}
                    </button>
                  );
                })()}
              </div>
              <div className="tc-book-note">{dict.tc_pay_note}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

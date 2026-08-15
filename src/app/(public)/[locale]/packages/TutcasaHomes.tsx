"use client";

/* Inline TutCasa partner-homes panel — the accommodation OPTION inside the
   package configurator (Amanah is a tour operator: a stay is added to a
   package, never sold alone; checkout enforces that too).

   With trip dates chosen, every home is quoted live against TutCasa and only
   the homes that actually FIT (available, min-stay satisfied) are shown, each
   card carrying the exact all-in total and its own "Add to your package"
   button. "View details" is optional. Request-to-book homes carry an
   owner-confirmation notice. Checkout re-derives every price from a fresh
   TutCasa hold — nothing here is price authority. */

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import SideCart from "@/components/SideCart";
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

type QuoteState = TutcasaQuote | "loading";

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
  const { dict } = useI18n();
  const { add, items } = useCart();
  const { rateUSD } = useCurrency();
  const [homes, setHomes] = useState<TutcasaListing[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  // Slide-in cart: review the trip without ever leaving this page.
  const [sideOpen, setSideOpen] = useState(false);

  // Owner-approved homes can't be sold instantly (TutCasa partner API refuses
  // holds for them) — the guest sends a request on TutCasa instead.
  const requestHref = (h: TutcasaListing) =>
    hasDates
      ? `${h.bookUrl}?${new URLSearchParams({ ci: checkin, co: checkout, guests: String(Math.max(1, guests)) })}`
      : h.bookUrl;

  const hasDates = Boolean(checkin && checkout);

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

  /* Quote EVERY home for the chosen dates (debounced): powers per-card exact
     totals, per-card booking, and hiding the homes that don't fit. */
  useEffect(() => {
    if (!hasDates || !homes?.length) {
      setQuotes({});
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      setQuotes(Object.fromEntries(homes.map((h) => [h.slug, "loading" as const])));
      homes.forEach((h) => {
        fetchTutcasaQuote(h.slug, checkin, checkout, guests).then((q) => {
          if (alive) setQuotes((prev) => ({ ...prev, [h.slug]: q ?? { ok: false, error: "UNAVAILABLE" } }));
        });
      });
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDates, homes, checkin, checkout, guests]);

  if (homes !== null && homes.length === 0) {
    return <div className="tc-panel tc-empty">{dict.tc_none}</div>;
  }

  const okQuote = (slug: string): Extract<TutcasaQuote, { ok: true }> | null => {
    const q = quotes[slug];
    return q && q !== "loading" && q.ok ? q : null;
  };

  /* With dates: hide homes whose quote came back as a hard no (taken dates,
     min stay, …). While loading, cards stay visible with a loading price. */
  const visibleHomes = (homes ?? []).filter((h) => {
    if (!hasDates) return true;
    const q = quotes[h.slug];
    return !(q && q !== "loading" && !q.ok);
  });

  const addStay = (h: TutcasaListing, q: Extract<TutcasaQuote, { ok: true }>) => {
    const details = [
      `${fmtDate(checkin)} → ${fmtDate(checkout)}`,
      `${q.nights} ${dict.tc_quote_nights} · ${Math.max(1, guests)} ${dict.tc_guests}`,
      h.instantBook ? "TutCasa · instant booking" : "TutCasa · owner confirmation pending",
    ];
    add({
      kind: "stay",
      title: h.title,
      subtitle: `${h.city} · ${h.propertyType}`,
      image: h.photos[0]?.url,
      details,
      total: Math.round(q.total * rateUSD),
      people: Math.max(1, guests),
      meta: {
        stay_slug: h.slug,
        ci: checkin,
        co: checkout,
        guests: String(Math.max(1, guests)),
        usd_total: String(q.total),
        instant: h.instantBook ? "1" : "0",
        currency: "MXN",
      },
    });
    onChoose({ slug: h.slug, title: h.title });
  };

  const openHome = visibleHomes.find((h) => h.slug === open) ?? null;

  return (
    <div className="tc-panel">
      <div className="tc-partner-line">{dict.tc_partner_line}</div>

      {homes === null ? (
        <div className="tc-loading">{dict.tc_loading}</div>
      ) : visibleHomes.length === 0 ? (
        <div className="tc-empty-note">{dict.tc_no_homes}</div>
      ) : (
        <>
          <div className="tc-row">
            {visibleHomes.map((h) => {
              const isOpen = open === h.slug;
              const isChosen = chosen?.slug === h.slug;
              const added = inCart(h.slug);
              const q = okQuote(h.slug);
              const loading = hasDates && quotes[h.slug] === "loading";
              const canAdd = !added && Boolean(q) && guests <= h.maxGuests;
              return (
                <div key={h.slug} className={`tc-card${isChosen || added ? " chosen" : ""}${isOpen ? " open" : ""}`}>
                  {h.photos[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tc-photo" src={h.photos[0].url} alt={h.title} loading="lazy" />
                  ) : (
                    <PhotoFallback />
                  )}
                  <div className="tc-card-body">
                    <div className="tc-card-top">
                      <span className="tc-title">{h.title}</span>
                      {h.rating != null && <span className="tc-rating">★ {h.rating}</span>}
                    </div>
                    <div className="tc-city">
                      {h.city} · {h.propertyType}
                    </div>
                    <div className="tc-specs">
                      {dict.tc_up_to} {h.maxGuests} {dict.tc_guests} · {h.bedrooms} {dict.tc_bedrooms} · {h.bathrooms} {dict.tc_bathrooms}
                    </div>
                    <div className="tc-price-line">
                      {q ? (
                        <>
                          <span className="tc-price">{fmtUsd(q.total)}</span>
                          <span className="tc-per"> {dict.tc_total_for_stay} · {q.nights} {dict.tc_quote_nights}</span>
                        </>
                      ) : loading ? (
                        <span className="tc-per">{dict.tc_loading}</span>
                      ) : (
                        <>
                          <span className="tc-from">{dict.tc_from}</span>{" "}
                          <span className="tc-price">{fmtUsd(h.pricing.allInNightly)}</span>
                          <span className="tc-per">{dict.tc_night_allin}</span>
                        </>
                      )}
                    </div>
                    {/* Primary shortcut: book straight from the card.
                        Owner-approved homes route to a TutCasa request instead
                        (the partner API refuses instant holds for them). */}
                    {added ? (
                      <button className="tc-add-btn added" onClick={() => setSideOpen(true)}>
                        ✓ {dict.tc_added} — {dict.tc_view_cart}
                      </button>
                    ) : !h.instantBook ? (
                      <a
                        className="tc-add-btn request"
                        href={requestHref(h)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {dict.tc_request_btn} ↗
                      </a>
                    ) : (
                      <button
                        className="tc-add-btn"
                        disabled={!canAdd}
                        title={!canAdd ? dict.tc_pick_dates : undefined}
                        onClick={() => {
                          if (q) addStay(h, q);
                        }}
                      >
                        {dict.tc_add}
                      </button>
                    )}
                    <button className="tc-view-btn" onClick={() => setOpen(isOpen ? null : h.slug)}>
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

              {!openHome.instantBook && <div className="tc-warn">{dict.tc_request_note}</div>}
              {guests > openHome.maxGuests && <div className="tc-warn">{dict.tc_too_small}</div>}

              {/* All-in price for the chosen dates */}
              <div className="tc-quote">
                {!hasDates ? (
                  <span className="tc-quote-hint">{dict.tc_pick_dates}</span>
                ) : quotes[openHome.slug] === "loading" ? (
                  <span className="tc-quote-hint">{dict.tc_loading}</span>
                ) : okQuote(openHome.slug) ? (
                  (() => {
                    const q = okQuote(openHome.slug)!;
                    return (
                      <>
                        <div className="tc-quote-main">
                          <span className="tc-quote-label">
                            {dict.tc_quote_total} · {q.nights} {dict.tc_quote_nights}
                          </span>
                          <span className="tc-quote-total">{fmtUsd(q.total)}</span>
                        </div>
                        <div className="tc-quote-sub">
                          {dict.tc_quote_paid_full} {fmtUsd(q.securityDeposit)} {dict.tc_quote_deposit}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <span className="tc-quote-hint">{dict.tc_pick_dates}</span>
                )}
              </div>

              <div className="tc-actions">
                {inCart(openHome.slug) ? (
                  <>
                    <button className="tc-choose-btn chosen" disabled>
                      ✓ {dict.tc_added}
                    </button>
                    <button className="tc-book-btn" onClick={() => setSideOpen(true)}>
                      {dict.tc_view_cart}
                    </button>
                  </>
                ) : !openHome.instantBook ? (
                  <a
                    className="tc-book-btn tc-book-cta"
                    href={requestHref(openHome)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dict.tc_request_btn} ↗
                  </a>
                ) : (
                  <button
                    className="tc-book-btn tc-book-cta"
                    disabled={!okQuote(openHome.slug) || guests > openHome.maxGuests}
                    title={!okQuote(openHome.slug) ? dict.tc_pick_dates : undefined}
                    onClick={() => {
                      const q = okQuote(openHome.slug);
                      if (q) addStay(openHome, q);
                    }}
                  >
                    {dict.tc_add}
                  </button>
                )}
              </div>
              <div className="tc-book-note">
                {openHome.instantBook ? dict.tc_pay_note : dict.tc_request_note}
              </div>
            </div>
          )}
        </>
      )}

      <SideCart open={sideOpen} onClose={() => setSideOpen(false)} />
    </div>
  );
}

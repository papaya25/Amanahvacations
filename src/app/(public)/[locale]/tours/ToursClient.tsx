"use client";

/* Ported from Maher's Wix tours embed, with group-tier pricing: each tour has
   a TOTAL price per group size (2–6 people; Cozumel from 3) with the group
   discount built in — NOT a flat per-person price × people. 24h booking lead
   time, Buy Now handoff to checkout, and the WhatsApp/email request flow for
   on-request tours are preserved. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import type { AdminTour as AdminTourInput } from "@/lib/content/tours";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";
import { TOURS, parseTierPrices, tourPaxOptions, tourTotalFor, type Tour, type Stop } from "./data";
import type { Activity } from "../packages/data";
import ActivityPicker, { activityChargeTotal } from "@/components/ActivityPicker";
import TourParkTabs from "@/components/TourParkTabs";

const WA_NUMBER = "529903516948";
const EMAIL = "booking@amanahvacations.com";

const WA_ICON = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="white" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const fmtDate = (v: string) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Not selected";

export default function ToursClient({
  dbTours,
  defaultTours,
  singleActivities,
}: {
  dbTours?: AdminTourInput[];
  /** Locale-translated copy of the built-in TOURS list, used for display when
      the admin hasn't saved custom tours. Falls back to English TOURS. */
  defaultTours?: Tour[];
  /** Translated single activities bookable on their own (add-on catalogue
      minus the combos already shown as tour cards). */
  singleActivities?: Activity[];
}) {
  const BUILTIN = defaultTours ?? TOURS;
  /* Admin-managed content from the DB overrides the built-in list; card
     descriptions (not editable in admin yet) carry over from defaults by key. */
  const TOURS_EFFECTIVE: Tour[] = useMemo(() => {
    if (!dbTours?.length) return BUILTIN;
    const descByKey: Record<string, string> = {};
    BUILTIN.forEach((t) => {
      if (t.key) descByKey[t.key] = t.desc;
    });
    // Admin tours without their own tiers inherit the built-in tier table by
    // key, so tier pricing survives an admin save made before tiers existed.
    const tiersByKey: Record<string, Record<number, number>> = {};
    BUILTIN.forEach((t) => {
      if (t.key && t.groupPrices) tiersByKey[t.key] = t.groupPrices;
    });
    return dbTours.map((t) => ({
      key: t.key,
      name: t.name,
      sub: t.sub,
      dur: t.dur,
      price: t.onreq ? null : t.price > 0 ? t.price : null,
      offer: !t.onreq && t.offer > 0 ? t.offer : undefined,
      groupPrices: t.onreq ? undefined : parseTierPrices(t.prices) ?? tiersByKey[t.key],
      img: t.img,
      desc: descByKey[t.key] ?? "",
      stops: t.stops.map((s): Stop => [s.time, s.place, s.desc]),
      onreq: t.onreq,
    }));
  }, [dbTours, BUILTIN]);
  const router = useRouter();
  const { add } = useCart();
  const { format } = useCurrency();
  const { locale, dict } = useI18n();
  const [people, setPeople] = useState<Record<number, number>>({});
  const [dates, setDates] = useState<Record<number, string>>({});
  const [openItin, setOpenItin] = useState<Record<number, boolean>>({});
  const [modalTour, setModalTour] = useState<Tour | null>(null);
  const [comment, setComment] = useState("");
  /* "Just One Activity?" section */
  const [singlesSel, setSinglesSel] = useState<string[]>([]);
  const [singlesDate, setSinglesDate] = useState("");
  const [singlesPeople, setSinglesPeople] = useState(2);
  const [toast, setToast] = useState("");

  /* Deep links from destination pages (#tour-<key>): the router's own hash
     scroll doesn't fire reliably on this dynamic page, so land on the card
     ourselves (second pass once images/layout settle). */
  useEffect(() => {
    const goto = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    if (window.location.hash) {
      const t1 = window.setTimeout(goto, 150);
      const t2 = window.setTimeout(goto, 800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // earliest bookable date = tomorrow (24h lead time)
  const minDate = useMemo(() => {
    const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  /* Group-size limits per tour: tiered tours book between their smallest and
     largest priced group (e.g. 2–6, Cozumel 3–6); legacy flat-priced tours
     keep the old 1–6 range. */
  const paxRange = (t: Tour): { min: number; max: number } => {
    const opts = tourPaxOptions(t);
    return opts.length ? { min: opts[0], max: opts[opts.length - 1] } : { min: 1, max: 6 };
  };
  const paxOf = (idx: number) => {
    const { min, max } = paxRange(TOURS_EFFECTIVE[idx]);
    return Math.max(min, Math.min(max, people[idx] || min));
  };
  const step = (idx: number, d: number) => {
    const { min, max } = paxRange(TOURS_EFFECTIVE[idx]);
    setPeople((p) => ({ ...p, [idx]: Math.max(min, Math.min(max, (p[idx] || min) + d)) }));
  };

  const buy = (idx: number) => {
    const t = TOURS_EFFECTIVE[idx];
    const date = dates[idx];
    if (!date) {
      showToast(dict.tourc_toast_date);
      return;
    }
    const ppl = paxOf(idx);
    /* Total for this group size — tier table first (group discount built in);
       legacy per-person × people only for tours without tiers. */
    const tierTotal = tourTotalFor(t, ppl);
    const legacyUnit =
      t.price != null && t.offer != null && t.offer < t.price ? t.offer : (t.price as number);
    const total = tierTotal ?? legacyUnit * ppl;
    add({
      kind: "tour",
      title: t.name,
      subtitle: t.sub,
      image: t.img,
      details: [
        fmtDate(date),
        `${ppl} ${ppl === 1 ? "person" : "people"}`,
        t.dur,
      ],
      total,
      people: ppl,
      meta: {
        pkgId: "tour",
        tour_only: "1",
        tour_key: t.key ?? "",
        currency: "MXN",
        people: String(ppl),
        date: fmtDate(date),
      },
    });
    router.push(localizeHref("/checkout", locale));
  };


  const singlesByName: Record<string, Activity> = {};
  (singleActivities ?? []).forEach((a) => (singlesByName[a.name] = a));

  const buySingles = () => {
    if (!singlesDate) {
      showToast(dict.tourc_toast_date);
      return;
    }
    const n = Math.max(1, singlesPeople);
    const sel = singlesSel.map((name) => singlesByName[name]).filter(Boolean);
    const priced = sel.filter((a) => activityChargeTotal(a, n) !== null);
    const human = sel.filter((a) => activityChargeTotal(a, n) === null).map((a) => a.name);
    if (!priced.length) return;
    if (human.length > 0) {
      const proceed = confirm(
        "These selections need to be arranged personally and are NOT charged now:\n\n" +
          human.join(", ") +
          "\n\nOur team will follow up to finalize and charge those separately. Continue to checkout with the rest?"
      );
      if (!proceed) return;
    }
    priced.forEach((act, i) => {
      add({
        kind: "activity",
        title: act.name,
        details: [fmtDate(singlesDate), `${n} ${n === 1 ? "person" : "people"}`],
        total: activityChargeTotal(act, n) as number,
        people: n,
        meta: {
          activity_id: act.id,
          currency: "MXN",
          people: String(n),
          date: fmtDate(singlesDate),
          ...(i === 0 && human.length ? { addons_human: human.join(", ") } : {}),
        },
      });
    });
    router.push(localizeHref("/checkout", locale));
  };

  const contactLinks = useMemo(() => {
    if (!modalTour) return { wa: "#", email: "#" };
    const c = comment.trim();
    let lines = `🌴 Tour: ${modalTour.name}\n💬 Pricing: On Request`;
    if (c) lines += `\n\n💬 Message: ${c}`;
    const wa = encodeURIComponent(`Hello Amanah Vacations! 👋\n\nI'd like to request this tour:\n\n${lines}\n\nThank you!`);
    const subj = encodeURIComponent(`Tour Request — ${modalTour.name}`);
    const body = encodeURIComponent(`Hello Amanah Vacations,\n\n${lines}\n\nThank you!`);
    return {
      wa: `https://wa.me/${WA_NUMBER}?text=${wa}`,
      email: `mailto:${EMAIL}?subject=${subj}&body=${body}`,
    };
  }, [modalTour, comment]);

  return (
    <div id="amanah-tours">
      <div className="at-header">
        <div className="at-eyebrow">{dict.footer_tagline}.</div>
        <h1>{dict.tourc_title}</h1>
        <div className="at-rule" />
        <p>{dict.tourc_intro}</p>
      </div>

      <TourParkTabs active="tours" />

      <div className="at-wrap">
        <div className="at-grid">
          {TOURS_EFFECTIVE.map((t, idx) => {
            const ppl = paxOf(idx);
            const tiered = tourPaxOptions(t).length > 0;
            const tierTotal = tourTotalFor(t, ppl);
            const total = tierTotal ?? (t.price ? t.price * ppl : 0);
            const perPerson = total > 0 ? Math.round(total / ppl) : 0;
            // Legacy per-person offers only apply to tours without tier pricing.
            const hasOffer = !tiered && t.price != null && t.offer != null && t.offer < t.price;
            const offerTotal = hasOffer ? (t.offer as number) * ppl : 0;
            const offerPct = hasOffer ? Math.round((1 - (t.offer as number) / (t.price as number)) * 100) : 0;
            return (
              // The id anchors deep links from the destination guide pages
              // ("We run this one — see the tour" → /tours#tour-<key>).
              <div key={t.name} id={t.key ? `tour-${t.key}` : undefined} className="at-card">
                <div className="at-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} loading="lazy" />
                  <div className="at-badge-duration">{t.dur}</div>
                  {t.onreq && <div className="at-badge-onreq">{dict.tourc_on_request}</div>}
                </div>
                <div className="at-card-body">
                  <div className="at-card-name">{t.name}</div>
                  <div className="at-card-subtitle">{t.sub}</div>
                  <div className="at-card-desc">{t.desc}</div>

                  {t.stops.length > 0 && (
                    <>
                      <button
                        type="button"
                        className={`at-itin-toggle${openItin[idx] ? " open" : ""}`}
                        onClick={() => setOpenItin((p) => ({ ...p, [idx]: !p[idx] }))}
                      >
                        {dict.tourc_see_itinerary} <span className="at-chev">▾</span>
                      </button>
                      <div className={`at-itin${openItin[idx] ? " open" : ""}`}>
                        <div className="at-itin-inner">
                          {t.stops.map((s, si) => (
                            <div key={s[1] + si} className="at-stop">
                              <div className="at-stop-line-wrap">
                                <div className="at-stop-num">{si + 1}</div>
                                {si < t.stops.length - 1 && <div className="at-stop-line" />}
                              </div>
                              <div className="at-stop-content">
                                <div className="at-stop-time">{s[0]}</div>
                                <div className="at-stop-name">{s[1]}</div>
                                {s[2] && <div className="at-stop-desc">{s[2]}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="at-divider" />
                  <div className="at-controls-c">
                    {t.onreq ? (
                      <>
                        <div className="at-price-row">
                          <div className="at-label">{dict.tourc_pricing}</div>
                          <div className="at-amount">
                            <span className="at-total" style={{ color: "var(--at-clay)" }}>
                              {dict.tourc_on_request}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="at-buy-btn onreq"
                          onClick={() => {
                            setComment("");
                            setModalTour(t);
                          }}
                        >
                          {dict.tourc_request_tour}
                        </button>
                        <div className="at-private-note">
                          🔒 {dict.tourc_private_onreq}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="at-field-row">
                          <div className="at-field">
                            <label htmlFor={`at-date-${idx}`}>{dict.tourc_date}</label>
                            <input
                              id={`at-date-${idx}`}
                              type="date"
                              min={minDate}
                              value={dates[idx] ?? ""}
                              onChange={(e) => setDates((p) => ({ ...p, [idx]: e.target.value }))}
                            />
                          </div>
                          <div className="at-field">
                            <label>
                              {dict.tourc_people}{" "}
                              <span
                                className="at-info"
                                data-tip={dict.tourc_people_tip}
                              >
                                i
                              </span>
                            </label>
                            <div className="at-stepper">
                              <button type="button" onClick={() => step(idx, -1)}>−</button>
                              <div className="at-count">{ppl}</div>
                              <button type="button" onClick={() => step(idx, 1)}>+</button>
                            </div>
                          </div>
                        </div>
                        <div className="at-price-row">
                          <div className="at-label">{dict.tourc_pricing}</div>
                          <div className="at-amount">
                            {hasOffer ? (
                              <span className="at-total">
                                <span className="at-price-was">{format(total)}</span>
                                <span className="at-price-offer">{format(offerTotal)}</span>
                                <span className="at-offer-badge">−{offerPct}%</span>
                              </span>
                            ) : tiered && perPerson > 0 ? (
                              /* Per-person hero (the travel anchor), full group
                                 total kept visible right below. */
                              <>
                                <span className="at-total">
                                  {format(perPerson)}
                                  <small style={{ fontSize: 12, fontWeight: 500 }}>{dict.pkgc_per_person}</small>
                                </span>
                                <div style={{ fontSize: 12.5, color: "var(--at-sage, #6b7b6c)", marginTop: 2 }}>
                                  {dict.pkgc_total_label}: {format(total)}
                                </div>
                              </>
                            ) : (
                              <span className="at-total">{format(total)}</span>
                            )}
                          </div>
                        </div>
                        <button type="button" className="at-buy-btn" onClick={() => buy(idx)}>
                          {dict.tourc_buy_now}
                        </button>
                        <div className="at-private-note">
                          🔒 {dict.tourc_private_note}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* "Just One Activity?" — book a single activity without a full tour */}
        {singleActivities && singleActivities.length > 0 && (
          <div className="apk-section">
            <h2 className="apk-section-title">{dict.act_singles_title}</h2>
            <p className="apk-section-sub">{dict.act_singles_sub}</p>
            <div className="apk-controls">
              <div className="apk-ctrl">
                <label>{dict.tourc_date}</label>
                <input
                  type="date"
                  min={minDate}
                  value={singlesDate}
                  onChange={(e) => setSinglesDate(e.target.value)}
                />
              </div>
              <div className="apk-ctrl" style={{ flex: "0 0 auto", minWidth: 0 }}>
                <label>{dict.tourc_people}</label>
                <div className="apk-stepper">
                  <button type="button" onClick={() => setSinglesPeople((p) => Math.max(1, p - 1))}>−</button>
                  <div className="apk-count">{singlesPeople}</div>
                  <button type="button" onClick={() => setSinglesPeople((p) => Math.min(6, p + 1))}>+</button>
                </div>
              </div>
            </div>
            <ActivityPicker
              activities={singleActivities}
              selected={singlesSel}
              onToggle={(name) =>
                setSinglesSel((prev) =>
                  prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
                )
              }
              people={singlesPeople}
            />
            {(() => {
              const n = Math.max(1, singlesPeople);
              const pricedSel = singlesSel
                .map((name) => singlesByName[name])
                .filter(Boolean)
                .filter((a) => activityChargeTotal(a, n) !== null);
              const total = pricedSel.reduce(
                (sum, a) => sum + (activityChargeTotal(a, n) as number),
                0
              );
              return (
                <div className="apk-total-bar">
                  <div>
                    <div className="apk-total-label">
                      {pricedSel.length} {dict.act_selected} · {n}{" "}
                      {n === 1 ? "person" : "people"}
                    </div>
                    <div className="apk-total-value">{format(total)}</div>
                  </div>
                  <button
                    type="button"
                    className="apk-buy"
                    disabled={pricedSel.length === 0}
                    onClick={buySingles}
                  >
                    {dict.tourc_buy_now}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Contact modal (on-request tours) */}
      <div
        className={`at-modal-ov${modalTour ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalTour(null);
        }}
      >
        {modalTour && (
          <div className="at-modal">
            <div className="at-modal-head">
              <div className="at-modal-title">{modalTour.name} — {dict.tourc_request_suffix}</div>
              <button className="at-modal-x" onClick={() => setModalTour(null)}>
                ×
              </button>
            </div>
            <div className="at-modal-body">
              <div className="at-sum">
                <div className="at-sum-row">
                  <span className="l">{dict.tourc_modal_tour}</span>
                  <span className="v">{modalTour.name}</span>
                </div>
                <div className="at-sum-row">
                  <span className="l">{dict.tourc_pricing}</span>
                  <span className="v">{dict.tourc_on_request}</span>
                </div>
              </div>
              <div className="at-modal-note">
                {dict.tourc_modal_note}
              </div>
              <textarea
                className="at-modal-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={dict.tourc_comment_ph}
              />
              <div className="at-modal-btns">
                <a className="at-wa" href={contactLinks.wa} target="_blank" rel="noopener noreferrer">
                  {WA_ICON} {dict.tourc_send_wa}
                </a>
                <a className="at-email" href={contactLinks.email}>
                  ✉️ {dict.tourc_send_email}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`at-toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}

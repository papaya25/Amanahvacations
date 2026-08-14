"use client";

/* Parks & Experiences — same design as the tours page (shares tours.css).
   Every park is per-person priced (ticket + private round-trip transport) and
   books straight into the cart as kind:"activity"; checkout re-derives the
   price server-side from the add-on catalogue by activity id, so the amount
   charged never comes from the browser. */

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";
import TourParkTabs from "@/components/TourParkTabs";
import { PARKS, type Park } from "./data";

const MAX_PEOPLE = 10;

const fmtDate = (v: string) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Not selected";

export default function ParksClient({ parks }: { parks?: Park[] }) {
  const PARKS_EFFECTIVE = parks ?? PARKS;
  const router = useRouter();
  const { add } = useCart();
  const { format } = useCurrency();
  const { locale, dict } = useI18n();
  const [people, setPeople] = useState<Record<string, number>>({});
  const [dates, setDates] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // earliest bookable date = tomorrow (24h lead time, same as tours)
  const minDate = useMemo(() => {
    const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const paxOf = (id: string) => Math.max(1, Math.min(MAX_PEOPLE, people[id] || 2));
  const step = (id: string, d: number) =>
    setPeople((p) => ({ ...p, [id]: Math.max(1, Math.min(MAX_PEOPLE, (p[id] || 2) + d)) }));

  const buy = (park: Park) => {
    const date = dates[park.id];
    if (!date) {
      showToast(dict.tourc_toast_date);
      return;
    }
    const ppl = paxOf(park.id);
    add({
      kind: "activity",
      title: park.name,
      subtitle: park.sub,
      image: park.img,
      details: [
        fmtDate(date),
        `${ppl} ${ppl === 1 ? "person" : "people"}`,
        park.dur,
      ],
      total: park.price * ppl,
      people: ppl,
      meta: {
        activity_id: park.id,
        currency: "MXN",
        people: String(ppl),
        date: fmtDate(date),
      },
    });
    router.push(localizeHref("/checkout", locale));
  };

  return (
    <div id="amanah-tours">
      <div className="at-header">
        <div className="at-eyebrow">{dict.footer_tagline}.</div>
        <h1>{dict.parks_title}</h1>
        <div className="at-rule" />
        <p>{dict.parks_intro}</p>
      </div>

      <TourParkTabs active="parks" />

      <div className="at-wrap">
        <div className="at-grid">
          {PARKS_EFFECTIVE.map((park) => {
            const ppl = paxOf(park.id);
            const total = park.price * ppl;
            return (
              <div key={park.id} className="at-card">
                <div
                  className={`at-card-img${park.imgFit === "contain" ? " pk-contain" : ""}`}
                  style={park.imgFit === "contain" ? { background: park.imgBg } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={park.img} alt={park.name} loading="lazy" />
                  <div className="at-badge-duration">{park.dur}</div>
                </div>
                <div className="at-card-body">
                  <div className="at-card-name">{park.name}</div>
                  <div className="at-card-subtitle">{park.sub}</div>
                  <div className="at-card-desc">{park.desc}</div>

                  <div className="pk-included">✓ {dict.parks_included}</div>

                  <div className="at-divider" />
                  <div className="at-controls-c">
                    <div className="at-field-row">
                      <div className="at-field">
                        <label htmlFor={`pk-date-${park.id}`}>{dict.tourc_date}</label>
                        <input
                          id={`pk-date-${park.id}`}
                          type="date"
                          min={minDate}
                          value={dates[park.id] ?? ""}
                          onChange={(e) => setDates((p) => ({ ...p, [park.id]: e.target.value }))}
                        />
                      </div>
                      <div className="at-field">
                        <label>{dict.tourc_people}</label>
                        <div className="at-stepper">
                          <button type="button" onClick={() => step(park.id, -1)}>−</button>
                          <div className="at-count">{ppl}</div>
                          <button type="button" onClick={() => step(park.id, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                    <div className="at-price-row">
                      <div className="at-label">{dict.tourc_pricing}</div>
                      <div className="at-amount">
                        {/* Per-person hero (the travel anchor), group total below —
                            same hierarchy as tours and packages. */}
                        <span className="at-total">
                          {format(park.price)}
                          <small style={{ fontSize: 12, fontWeight: 500 }}>{dict.pkgc_per_person}</small>
                        </span>
                        <div style={{ fontSize: 12.5, color: "var(--at-sage, #6b7b6c)", marginTop: 2 }}>
                          {dict.pkgc_total_label}: {format(total)}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="at-buy-btn" onClick={() => buy(park)}>
                      {dict.tourc_buy_now}
                    </button>
                    <div className="at-private-note">
                      🔒 {dict.tourc_private_note}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`at-toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}

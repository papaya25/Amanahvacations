"use client";

/* Ported from Maher's Wix tours embed. Business logic preserved: per-tour
   pricing (people × price, MXN + USD), 24h booking lead time, group cap of 6,
   Buy Now handoff to the booking URL with identical params, and the
   WhatsApp/email request flow for on-request tours. */

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

type Stop = [string, string, string];
type Tour = {
  key: string | null;
  name: string;
  sub: string;
  dur: string;
  price: number | null;
  img: string;
  desc: string;
  stops: Stop[];
  onreq?: boolean;
};

const TOURS: Tour[] = [
  {
    key: "akumalcenotes", name: "Cenotes, Coral & Sea Turtles", sub: "Dos Ojos Cenote + Akumal Snorkeling",
    dur: "6 hours", price: 2350, img: "/images/tours/akumalcenotes.jpg",
    desc: "Swim through the sacred chambers of Cenote Dos Ojos, then snorkel alongside sea turtles in Akumal Bay.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen", "Private, air-conditioned van pickup from your hotel or villa. Cold water and refreshments on board."],
      ["1–2 Hours", "Cenote Dos Ojos", "Swim through crystal-clear water beneath ancient limestone formations."],
      ["Midday · Boat Snorkel", "Akumal Bay", "A small boat out to snorkel among sea turtles, tropical fish, and living coral."],
      ["Afternoon · At Leisure", "Akumal Beach", "Free time on the sand to rinse off and relax before the drive back."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "tulumcenotes", name: "Cenotes & the Ruins of Tulum", sub: "Dos Ojos Cenote + Tulum Archaeological Site",
    dur: "6–8 hours", price: 3700, img: "/images/tours/tulumcenotes.jpg",
    desc: "A private guided tour of the only Maya city built on the coast, plus a swim in Cenote Dos Ojos.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen", "Private, air-conditioned van pickup from your hotel or villa."],
      ["1–2 Hours", "Cenote Dos Ojos", "A refreshing swim in one of the region's most beautiful cenotes."],
      ["Guided Tour", "Tulum Archaeological Site", "Explore the clifftop Maya ruins above the Caribbean with your private guide."],
      ["Afternoon · Your Choice", "City Tour or Playa Ruinas", "Relax on the beach below the ruins, or a short city tour."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "cobacenotes", name: "Coba Ruins & Jungle Cenotes", sub: "Coba Zone + Choo-Ha & Tankach-Ha",
    dur: "Full day", price: 3900, img: "/images/tours/cobacenotes.jpg",
    desc: "Climb into the jungle to Nohoch Mul, the tallest pyramid on the Yucatán Peninsula, then cool off in two hidden cenotes.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen", "Private, air-conditioned van pickup from your hotel or villa."],
      ["Guided Tour", "Coba Archaeological Zone", "Explore the jungle-wrapped ruins and the towering Nohoch Mul pyramid."],
      ["Swim & Explore", "Cenote Choo-Ha", "Cool off in a stunning underground cenote."],
      ["Swim & Explore", "Cenote Tankach-Ha", "A second hidden cenote, deep in the jungle."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "cozumel", name: "Cozumel Private Boat Snorkeling", sub: "El Cielo, El Cielito, Colombia & Lever Reefs",
    dur: "Approx. 4 hours", price: 4600, img: "/images/tours/cozumel.jpg",
    desc: "A private boat to four of Cozumel's best reefs, with fresh ceviche and drinks on board.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen to Cozumel", "Pickup and ferry crossing to the island."],
      ["Snorkel Stop", "El Cielo & El Cielito Reefs", "Crystal-clear shallow reefs famous for starfish."],
      ["Snorkel Stop", "Colombia & Lever Reefs", "Vibrant coral gardens teeming with life."],
      ["Onboard", "Snacks & Drinks", "Fresh ceviche, snacks and drinks on your private boat."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "akumaltulum", name: "Tulum & Akumal", sub: "Dos Ojos + Tulum Ruins + Akumal Snorkeling",
    dur: "Full day", price: 5850, img: "/images/tours/akumaltulum.jpg",
    desc: "The best of both worlds — ancient ruins, a sacred cenote, and sea turtles in one action-packed day.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen", "Private, air-conditioned van pickup."],
      ["Swim & Explore", "Cenote Dos Ojos", "A refreshing swim beneath limestone formations."],
      ["Guided Tour", "Tulum Archaeological Site", "The clifftop Maya ruins above the Caribbean."],
      ["Boat Snorkel", "Akumal Bay", "Snorkel among sea turtles and living coral."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "chichen", name: "Chichen Itza & Valladolid", sub: "New 7 Wonders + Suytun & Samulá Cenotes",
    dur: "Full day", price: 6600, img: "/images/tours/chichen.jpg",
    desc: "A wonder of the world, a colonial pueblo mágico, and two of the Yucatán's most beautiful cenotes.",
    stops: [
      ["Early Morning · Pickup", "Playa del Carmen", "An early start for a full day of wonders."],
      ["Quick Stop", "Valladolid", "A charming colonial pueblo mágico."],
      ["Swim & Explore", "Cenote Suytun", "The famous cenote with its iconic light beam."],
      ["Guided Tour", "Chichen Itza", "A private guided tour of the Wonder of the World."],
      ["Swim & Explore", "Cenote Samulá", "A beautiful cave cenote to end the day."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "rutacenotes", name: "Ruta de Cenotes", sub: "4 Cenotes + Diving Platform + Zip Line",
    dur: "Half day", price: 2900, img: "/images/tours/rutacenotes.jpg",
    desc: "Two open-air and two underground cenotes, a diving platform, and a water zip line in one jungle park.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen", "Private, air-conditioned van pickup."],
      ["Swim & Explore", "Two Open-Air Cenotes", "Sunlit cenotes surrounded by jungle."],
      ["Swim & Explore", "Two Underground Cenotes", "Mysterious cave cenotes."],
      ["Adventure", "Diving Platform & Zip Line", "A diving platform and a water zip line over a cenote."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: null, name: "Holbox Island Overnight Escape", sub: "2 Days, 1 Night",
    dur: "Overnight", price: null, onreq: true, img: "/images/tours/holbox.jpg",
    desc: "A car-free island of flamingos, bioluminescent water, and untouched beaches. Arranged personally with you.",
    stops: [],
  },
  {
    key: null, name: "Isla Contoy National Park", sub: "Ixlaché Reef + Isla Contoy + Isla Mujeres",
    dur: "Full day", price: null, onreq: true, img: "/images/tours/contoy.jpg",
    desc: "A protected bird sanctuary limited to 200 visitors a day — the wildest corner of the Mexican Caribbean. Arranged personally with you.",
    stops: [],
  },
];

const WA_ICON = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="white" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const fmtDate = (v: string) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Not selected";

export default function ToursClient() {
  const router = useRouter();
  const { add } = useCart();
  const { format } = useCurrency();
  const [people, setPeople] = useState<Record<number, number>>({});
  const [dates, setDates] = useState<Record<number, string>>({});
  const [openItin, setOpenItin] = useState<Record<number, boolean>>({});
  const [modalTour, setModalTour] = useState<Tour | null>(null);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState("");
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

  const step = (idx: number, d: number) =>
    setPeople((p) => ({ ...p, [idx]: Math.max(1, Math.min(6, (p[idx] || 1) + d)) }));

  const buy = (idx: number) => {
    const t = TOURS[idx];
    const date = dates[idx];
    if (!date) {
      showToast("Please choose a tour date first.");
      return;
    }
    const ppl = people[idx] || 1;
    const total = (t.price as number) * ppl;
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
    router.push("/checkout");
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
        <div className="at-eyebrow">Trust in Adventure.</div>
        <h1>Our Tours</h1>
        <div className="at-rule" />
        <p>
          Private, guided day adventures across the Riviera Maya and Yucatán — pick your date and
          group size, then choose the tour that calls to you. Every tour is fully private, just for
          your group.
        </p>
      </div>

      <div className="at-wrap">
        <div className="at-grid">
          {TOURS.map((t, idx) => {
            const ppl = people[idx] || 1;
            const total = t.price ? t.price * ppl : 0;
            return (
              <div key={t.name} className="at-card">
                <div className="at-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} loading="lazy" />
                  <div className="at-badge-duration">{t.dur}</div>
                  {t.onreq && <div className="at-badge-onreq">On Request</div>}
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
                        See itinerary <span className="at-chev">▾</span>
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
                          <div className="at-label">Pricing</div>
                          <div className="at-amount">
                            <span className="at-total" style={{ color: "var(--at-clay)" }}>
                              On Request
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
                          Request This Tour
                        </button>
                        <div className="at-private-note">
                          🔒 Private for your group · arranged personally with you
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="at-field-row">
                          <div className="at-field">
                            <label htmlFor={`at-date-${idx}`}>Date</label>
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
                              People{" "}
                              <span
                                className="at-info"
                                data-tip="For groups of more than 6, contact us to arrange your private tour."
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
                          <div className="at-label">Total</div>
                          <div className="at-amount">
                            <span className="at-total">{format(total)}</span>
                          </div>
                        </div>
                        <button type="button" className="at-buy-btn" onClick={() => buy(idx)}>
                          Buy Now
                        </button>
                        <div className="at-private-note">
                          🔒 Just your group — never combined with other people
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
              <div className="at-modal-title">{modalTour.name} — Request</div>
              <button className="at-modal-x" onClick={() => setModalTour(null)}>
                ×
              </button>
            </div>
            <div className="at-modal-body">
              <div className="at-sum">
                <div className="at-sum-row">
                  <span className="l">Tour</span>
                  <span className="v">{modalTour.name}</span>
                </div>
                <div className="at-sum-row">
                  <span className="l">Pricing</span>
                  <span className="v">On Request</span>
                </div>
              </div>
              <div className="at-modal-note">
                ✨ This tour is arranged personally. Our team will reach out shortly to confirm
                availability, dates, and details.
              </div>
              <textarea
                className="at-modal-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any questions or special requests? (optional)"
              />
              <div className="at-modal-btns">
                <a className="at-wa" href={contactLinks.wa} target="_blank" rel="noopener noreferrer">
                  {WA_ICON} Send via WhatsApp
                </a>
                <a className="at-email" href={contactLinks.email}>
                  ✉️ Send via Email
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

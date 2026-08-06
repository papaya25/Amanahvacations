"use client";

/* Ported from Maher's Wix packages embed. All business logic (pricing engine,
   gating rules, checkout URL params, WhatsApp/email quote generation) is kept
   intact — only the rendering moved from DOM manipulation to React state. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import type { AdminAddon } from "@/lib/content/addons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";
import {
  ACCOM_TIERS as DEFAULT_ACCOM_TIERS,
  ACTIVITIES as DEFAULT_ACTIVITIES,
  RECOMMENDED as DEFAULT_RECOMMENDED,
  REC_TIPS as DEFAULT_REC_TIPS,
  PKG_DETAILS as DEFAULT_PKG_DETAILS,
  PKG_TIERS,
  ADDON_CATEGORY,
  PACKAGE_IDS,
  type Activity,
  type PkgDetails,
  type PkgId,
} from "./data";
import { parseTierPrices, tourTotalFor } from "../tours/data";

/* ── CONFIG ── */
const WA_NUMBER = "529903516948";
const EMAIL = "booking@amanahvacations.com";
const CURRENCY = "MXN";
const MIN_NIGHTS_PACKAGE = 3;
const MIN_NIGHTS_BYO = 1;


const MIN_PEOPLE: Partial<Record<PkgId, number>> = { family: 3, water: 3 };

type PkgMeta = { name: string; tagline: string; badge: string; icon: string; photo: string; includes: string[] };
const DEFAULT_PKG_META: Record<PkgId, PkgMeta> = {
  basic: {
    name: "The Basics",
    tagline: "The essentials, done properly — ruins, cenote, turtles and the town",
    badge: "Essential",
    icon: "🌿",
    photo: "/images/pkg/basic.jpg",
    includes: [
      "Private airport transfers — Cancún International, arrival & departure",
      "Tulum Ruins, Cenote Dos Ojos & Akumal — the signature day",
      "Snorkelling in Playa del Carmen — the reef minutes from town",
      "Playa del Carmen tour — Quinta Avenida & the town",
      "24/7 WhatsApp concierge — Arabic, English, French or Spanish",
      "Welcome kit — printed itinerary & local guidance",
    ],
  },
  family: {
    name: "Family Tour",
    tagline: "For families — turtles, monkeys, cenotes and a park built for wonder",
    badge: "Kid-Friendly",
    icon: "👨‍👩‍👧‍👦",
    photo: "/images/pkg/family.jpg",
    includes: [
      "Private airport transfers — Cancún International, arrival & departure",
      "Akumal & the Monkey Sanctuary — sea turtles & rescued wildlife",
      "Cenote Cristalino & Cenote Azul — open-air, shallow and easy",
      "Playa del Carmen tour — Quinta Avenida & the town",
      "Xenses Park — full admission",
      "24/7 WhatsApp concierge — Arabic, English, French or Spanish",
      "Welcome kit — printed itinerary & local guidance",
    ],
  },
  water: {
    name: "Water Lovers",
    tagline: "For those who live for the sea — reefs, turtles and the clearest water in the Caribbean",
    badge: "Water & Reef",
    icon: "🌊",
    photo: "/images/pkg/water.jpg",
    includes: [
      "Private airport transfers — Cancún International, arrival & departure",
      "Akumal & Cenote Dos Ojos — turtle snorkelling & the cave cenote",
      "Cozumel — private boat to El Cielo & El Cielito",
      "Ruta de los Cenotes — four cenotes, two underground, two open-air",
      "24/7 WhatsApp concierge — Arabic, English, French or Spanish",
      "Welcome kit — printed itinerary & local guidance",
    ],
  },
  explorer: {
    name: "Indiana Jones",
    tagline: "For the explorer — three Mayan cities, four cenotes, and the Caribbean",
    badge: "Culture & Wonders",
    icon: "🏛️",
    photo: "/images/pkg/explorer.jpg",
    includes: [
      "Private airport transfers — Cancún International, arrival & departure",
      "Chichén Itzá & Valladolid — with Cenote Suytun & Cenote Samulá",
      "Cobá — with Cenote Choo-Ha & Cenote Tankach-Ha",
      "Tulum Ruins & Akumal — clifftop ruins & turtle snorkelling",
      "Playa del Carmen tour — Quinta Avenida & the town",
      "24/7 WhatsApp concierge — Arabic, English, French or Spanish",
      "Welcome kit — printed itinerary & local guidance",
    ],
  },
  honeymoon: {
    name: "Honeymoon Escape",
    tagline: "For two — private, halal-certified, unforgettable",
    badge: "Couples",
    icon: "💞",
    photo: "/images/pkg/honeymoon.jpg",
    includes: [
      "Private airport transfers — Cancún International, arrival & departure",
      "Holbox Island — full day by private boat",
      "Tulum Ruins, Cenote Dos Ojos & Akumal — private guided day",
      "Xcaret Plus — full park access, buffet & the evening show",
      "Jungle Adventure — ATV, ziplines & two cenotes",
      "Playa del Carmen evening — Quinta Avenida & romantic dinner",
      "100% halal certified — every meal & supplier verified",
      "24/7 WhatsApp concierge — Arabic, English, French or Spanish",
      "Welcome kit — itinerary, Qibla card & prayer schedule",
    ],
  },
};

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

type ModalState =
  | { kind: "quote"; pkgId: PkgId; pkgName: string }
  | { kind: "vip"; pkgName: string }
  | { kind: "byo-result" }
  | null;

/* Content fields the admin owns, delivered from the DB by the server page.
   The configurator mechanics (icons, min group size, recommended add-ons,
   activities) stay in code and are keyed to these same package ids. */
export type DbPackage = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number;
  offer: number;
  /** TOTAL group price (MXN) keyed by pax count — the price authority. */
  prices?: Record<string, number> | null;
  photo: string;
  includes: string; // one item per line
};

export default function PackagesClient({
  dbPackages,
  dbAddons,
  tActivities,
  tAccomTiers,
  tRecommended,
  tRecTips,
  tDetails,
}: {
  dbPackages?: DbPackage[];
  dbAddons?: AdminAddon[];
  /* Locale-translated copies of the built-in catalogue (add-ons, accommodation
     tiers, recommended add-ons, day-by-day details). Fall back to the English
     defaults. */
  tActivities?: Activity[];
  tAccomTiers?: typeof DEFAULT_ACCOM_TIERS;
  tRecommended?: typeof DEFAULT_RECOMMENDED;
  tRecTips?: typeof DEFAULT_REC_TIPS;
  tDetails?: Partial<Record<PkgId, PkgDetails>>;
}) {
  const router = useRouter();
  const ACTIVITIES = tActivities ?? DEFAULT_ACTIVITIES;
  const ACCOM_TIERS = tAccomTiers ?? DEFAULT_ACCOM_TIERS;
  const RECOMMENDED = tRecommended ?? DEFAULT_RECOMMENDED;
  const REC_TIPS = tRecTips ?? DEFAULT_REC_TIPS;
  const DETAILS = tDetails ?? DEFAULT_PKG_DETAILS;

  /* Admin-managed add-on list overrides the built-in one; emoji + description
     carry over from the defaults by id. An offer below the price becomes the
     effective per-person price. */
  const activities = useMemo<Activity[]>(() => {
    if (!dbAddons?.length) return ACTIVITIES;
    const byId: Record<string, Activity> = {};
    ACTIVITIES.forEach((a) => (byId[a.id] = a));
    return dbAddons.map((a) => {
      const base = byId[a.id];
      let price = a.onRequest || a.price <= 0 ? null : a.price;
      if (price !== null && a.offer && a.offer > 0 && a.offer < price) price = a.offer;
      return {
        id: a.id,
        name: a.name,
        emoji: base?.emoji ?? "✨",
        price,
        unit: a.unit,
        inCart: price !== null,
        desc: base?.desc ?? "",
        // Tier tables always come from the built-in catalogue (rate card).
        groupPrices: price !== null ? base?.groupPrices : undefined,
      };
    });
  }, [dbAddons, ACTIVITIES]);

  const actsByName = useMemo(() => {
    const m: Record<string, Activity> = {};
    activities.forEach((a) => (m[a.name] = a));
    return m;
  }, [activities]);
  const { add } = useCart();
  const { format } = useCurrency();
  const { locale, dict } = useI18n();

  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [kidsAges, setKidsAges] = useState<string[]>([]);
  const [accom, setAccomState] = useState(false);
  const [accomTier, setAccomTier] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<PkgId, string[]>>({
    basic: [], family: [], water: [], explorer: [], honeymoon: [],
  });
  const [recommendedActive, setRecommendedActive] = useState<Record<string, boolean>>({});
  const [detailsPkg, setDetailsPkg] = useState<PkgId | null>(null);
  const [openAddonPanels, setOpenAddonPanels] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<ModalState>(null);
  const [modalComment, setModalComment] = useState("");
  const [byoOpen, setByoOpen] = useState(false);
  const [byoAddonsOpen, setByoAddonsOpen] = useState(false);
  const [byoAddons, setByoAddons] = useState<string[]>([]);
  const [byoComment, setByoComment] = useState("");
  const [byoSubmitted, setByoSubmitted] = useState<{ addonStr: string; comment: string } | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Highlight the card matching ?plan= (arriving from the home trip picker).
  // A layout effect on mount sets the target before paint; a second effect
  // scrolls to it and clears the glow. Kept out of the initial render so the
  // hydrated HTML matches the server (no mismatch), and out of any Suspense
  // boundary so React 19 doesn't defer it until the first interaction.
  useEffect(() => {
    const plan = new URLSearchParams(window.location.search).get("plan");
    const valid = ["basic", "family", "water", "explorer", "honeymoon", "vip"];
    if (plan && valid.includes(plan)) setHighlighted(plan);
  }, []);

  useEffect(() => {
    if (!highlighted) return;
    const t = window.setTimeout(() => {
      gridRef.current
        ?.querySelector(`.pkg-card.${highlighted}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    const clear = window.setTimeout(() => setHighlighted(null), 6000);
    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, [highlighted]);

  /* ── helpers (logic identical to the embed) ── */
  const nights = (() => {
    if (!checkin || !checkout) return null;
    return Math.max(0, Math.round((+new Date(checkout) - +new Date(checkin)) / 86400000));
  })();
  const nightsOK = nights !== null && nights >= MIN_NIGHTS_PACKAGE;

  const accomTierName = () => ACCOM_TIERS.find((t) => t.id === accomTier)?.label ?? "";
  const accomText = () => (accom ? `Yes — ${accomTierName() || "hotel"}` : "Not needed");

  // "T00:00:00" forces local-time parsing — bare "YYYY-MM-DD" parses as UTC and
  // shows the previous day in timezones behind UTC (bug carried over from the embed)
  const fmtDate = (v: string) =>
    v
      ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
      : "Not selected";

  /* Merge admin-managed content from the DB over the built-in defaults, keyed
     by package id. Falls back to defaults when the backend has no matching row
     (or isn't configured), so the page always renders. */
  const byId = useMemo(() => {
    const m: Record<string, DbPackage> = {};
    (dbPackages ?? []).forEach((p) => (m[p.id] = p));
    return m;
  }, [dbPackages]);

  const pkgMeta = useMemo(() => {
    const out = { ...DEFAULT_PKG_META };
    PACKAGE_IDS.forEach((id) => {
      const db = byId[id];
      if (!db) return;
      out[id] = {
        ...DEFAULT_PKG_META[id],
        name: db.name || DEFAULT_PKG_META[id].name,
        tagline: db.tagline || DEFAULT_PKG_META[id].tagline,
        badge: db.badge || DEFAULT_PKG_META[id].badge,
        photo: db.photo || DEFAULT_PKG_META[id].photo,
        includes: db.includes ? db.includes.split("\n").filter(Boolean) : DEFAULT_PKG_META[id].includes,
      };
    });
    return out;
  }, [byId]);

  const getKidsAgesText = () => {
    if (kids === 0) return "None";
    return kidsAges
      .map((v, i) => (v !== "" && v != null ? `Child ${i + 1}: ${v}yr` : `Child ${i + 1}: age not set`))
      .join(", ");
  };

  /* Group tiers for a package: the DB's `prices` map wins, else the built-in
     rate-card tiers. The tier actually used for the current group (clamped to
     the offered range; honeymoon is always the 2-traveller tier). */
  const pkgTiers = (id: PkgId): Record<number, number> =>
    parseTierPrices(byId[id]?.prices ?? undefined) ?? PKG_TIERS[id];
  const tierUsed = (id: PkgId): { pax: number; total: number } => {
    const tiers = pkgTiers(id);
    const opts = Object.keys(tiers).map(Number).sort((a, b) => a - b);
    const mult = id === "honeymoon" ? 2 : adults + kids;
    const clamped = Math.min(Math.max(mult, opts[0]), opts[opts.length - 1]);
    const pax = opts.filter((p) => p <= clamped).pop() ?? opts[0];
    return { pax, total: tiers[pax] };
  };

  /* Per-person price shown on the card — the group tier for the current
     group size divided by its pax count (plus the recommended add-on when
     selected), so the card always shows the rate the group actually pays. */
  const priceMXN = (id: PkgId) => {
    const { pax, total } = tierUsed(id);
    let mxn = Math.round(total / pax);
    const rec = RECOMMENDED[id];
    if (rec && recommendedActive[id]) mxn += rec.price;
    return mxn;
  };

  /* One add-on's cost for a group of n: tiered tour add-ons charge their
     group total once; flat add-ons charge per person. */
  const addonTotalFor = (act: Activity, n: number) =>
    act.groupPrices ? tourTotalFor(act, n) ?? 0 : (act.price ?? 0) * n;

  const adjust = (type: "adults" | "kids", delta: number) => {
    if (type === "adults") setAdults((a) => Math.max(1, a + delta));
    else
      setKids((k) => {
        const next = Math.max(0, k + delta);
        setKidsAges((ages) => {
          const copy = [...ages];
          while (copy.length < next) copy.push("");
          copy.length = next;
          return copy;
        });
        return next;
      });
  };

  const setAccom = (val: boolean) => {
    setAccomState(val);
    setAccomTier(val ? accomTier || "4-star" : "");
  };

  const toggleAddon = (pkgId: PkgId, name: string) => {
    setSelectedAddons((prev) => {
      const cur = prev[pkgId];
      return { ...prev, [pkgId]: cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name] };
    });
  };

  const toggleRecommend = (pkgId: PkgId) =>
    setRecommendedActive((prev) => ({ ...prev, [pkgId]: !prev[pkgId] }));

  const packageTotalMXN = (pkgId: PkgId) => tierUsed(pkgId).total;

  /* Live total for the configured group — the package's group-tier total plus
     the selected payable add-ons and the recommended add-on. Mirrors buyNow's
     charge math so the number shown IS the number charged. */
  const displayTotalMXN = (pkgId: PkgId) => {
    const n = adults + kids;
    const mult = pkgId === "honeymoon" ? 2 : n;
    const cartAddons = (selectedAddons[pkgId] ?? []).filter(
      (name) => actsByName[name] && actsByName[name].price !== null && actsByName[name].inCart
    );
    let total = packageTotalMXN(pkgId);
    total += cartAddons.reduce((sum, name) => sum + addonTotalFor(actsByName[name], n), 0);
    const rec = RECOMMENDED[pkgId];
    if (rec && recommendedActive[pkgId]) total += rec.price * mult;
    return total;
  };

  /* ── BUY NOW — adds the configured booking to the cart, then goes to checkout ── */
  const buyNow = (pkgId: PkgId, pkgName: string, experience = "Standard") => {
    if (nights === null || nights < MIN_NIGHTS_PACKAGE) {
      alert(`Please select your check-in and check-out dates (minimum ${MIN_NIGHTS_PACKAGE} nights) before booking this package.`);
      return;
    }
    const minPeople = MIN_PEOPLE[pkgId] || 1;
    if (adults + kids < minPeople) {
      alert(`This package is available for groups of ${minPeople} travelers and up. Please adjust your adults/children count.`);
      return;
    }
    const addonNames = selectedAddons[pkgId] ?? [];
    const n = adults + kids;
    const mult = pkgId === "honeymoon" ? 2 : n;
    let cartAddons = addonNames.filter(
      (name) => actsByName[name] && actsByName[name].price !== null && actsByName[name].inCart
    );
    const humanAddons = addonNames.filter(
      (name) => !actsByName[name] || actsByName[name].price === null || !actsByName[name].inCart
    );
    const rec = RECOMMENDED[pkgId];
    const recSelected = !!(rec && recommendedActive[pkgId]);
    if (humanAddons.length > 0) {
      const proceed = confirm(
        "These add-ons need to be arranged personally and are NOT charged now:\n\n" +
          humanAddons.join(", ") +
          "\n\nOur team will follow up to finalize and charge those separately. Continue to checkout for your package" +
          (cartAddons.length > 0 || recSelected ? " and the other add-ons" : "") +
          "?"
      );
      if (!proceed) return;
    }
    let addonsTotal = cartAddons.reduce((sum, name) => sum + addonTotalFor(actsByName[name], n), 0);
    const cartAddonIdList = cartAddons.map((name) => actsByName[name].id);
    if (recSelected && rec) {
      addonsTotal += rec.price * mult;
      cartAddonIdList.push(rec.id);
      cartAddons = [...cartAddons, rec.name];
    }
    const total = packageTotalMXN(pkgId) + addonsTotal;

    const details: string[] = [];
    details.push(`${fmtDate(checkin)} → ${fmtDate(checkout)}`);
    details.push(
      `${nights} night${nights !== 1 ? "s" : ""}${accom ? " · with hotel" : " · no hotel"}`
    );
    details.push(
      `${adults} adult${adults !== 1 ? "s" : ""}${
        kids > 0 ? `, ${kids} child${kids !== 1 ? "ren" : ""}` : ""
      }`
    );
    if (cartAddons.length) details.push(`Add-ons: ${cartAddons.join(", ")}`);
    if (humanAddons.length) details.push(`On request: ${humanAddons.join(", ")}`);

    add({
      kind: "package",
      title: pkgName,
      subtitle: pkgMeta[pkgId].tagline,
      image: pkgMeta[pkgId].photo,
      details,
      total,
      people: n,
      meta: {
        pkgId,
        experience,
        family_choice: "",
        currency: CURRENCY,
        adults: String(adults),
        kids: String(kids),
        children_ages: getKidsAgesText(),
        nights: String(nights),
        checkin: fmtDate(checkin),
        checkout: fmtDate(checkout),
        accommodation: accomText(),
        accom_type: accom ? accomTier : "",
        addon_ids: cartAddonIdList.join(",") || "None",
        addons: cartAddons.join(", ") || "None",
        addons_human: humanAddons.join(", ") || "None",
      },
    });
    router.push(localizeHref("/checkout", locale));
  };

  /* ── Contact links (built live so they include the latest comment) ── */
  const buildContactLinks = useCallback(() => {
    if (!modal) return { wa: "#", email: "#" };
    const commentTxt = modalComment.trim();
    let lines = "";
    let subjectPrefix = "";
    if (modal.kind === "quote") {
      const addons = [...(selectedAddons[modal.pkgId] ?? [])];
      const rec = RECOMMENDED[modal.pkgId];
      if (rec && recommendedActive[modal.pkgId])
        addons.push(`${rec.name} (+${format(rec.price)}/person)`);
      const addonStr = addons.length > 0 ? addons.join(", ") : "None";
      lines =
        `📦 Package: ${modal.pkgName}\n` +
        `📅 Check-in: ${fmtDate(checkin)}\n📅 Check-out: ${fmtDate(checkout)}\n` +
        `🌙 Nights: ${nights === null ? "—" : nights}\n👤 Adults: ${adults}\n👶 Children: ${kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"}\n` +
        `🏨 Accommodation: ${accomText()}\n` +
        `➕ Add-ons: ${addonStr}`;
      subjectPrefix = "Quote Request — ";
    } else if (modal.kind === "vip") {
      lines =
        `I'm interested in the ${modal.pkgName}.\n\n` +
        `📅 Check-in: ${fmtDate(checkin)}\n📅 Check-out: ${fmtDate(checkout)}\n` +
        `👤 Adults: ${adults}\n👶 Children: ${kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"}`;
      subjectPrefix = "Custom Quote Request — ";
    } else {
      const s = byoSubmitted;
      lines =
        `📅 Check-in: ${fmtDate(checkin)}\n📅 Check-out: ${fmtDate(checkout)}\n` +
        `👤 Adults: ${adults}\n👶 Children: ${kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"}\n` +
        `🏨 Accommodation: ${accomText()}\n` +
        `➕ Activities of interest: ${s?.addonStr ?? "None yet"}`;
      if (s?.comment) lines += `\n\n💬 What they're dreaming of: ${s.comment}`;
      const waMsg = encodeURIComponent(
        `Hello Amanah Vacations! 👋\n\nI'd like to build a custom plan:\n\n${lines}\n\nPlease help me design a custom itinerary and quote. Thank you!`
      );
      const emailSubject = encodeURIComponent("Build Your Own Plan — Custom Quote Request");
      const emailBody = encodeURIComponent(
        `Hello Amanah Vacations,\n\nI would like to build a custom plan:\n\n${lines}\n\nPlease help me design a custom itinerary and quote.\n\nThank you!`
      );
      return {
        wa: `https://wa.me/${WA_NUMBER}?text=${waMsg}`,
        email: `mailto:${EMAIL}?subject=${emailSubject}&body=${emailBody}`,
      };
    }
    if (commentTxt) lines += `\n\n💬 Message: ${commentTxt}`;
    const waMsg = encodeURIComponent(
      `Hello Amanah Vacations! 👋\n\n${lines}\n\nPlease send me the full quote. Thank you!`
    );
    const pkgName = modal.kind === "quote" || modal.kind === "vip" ? modal.pkgName : "";
    const emailSubject = encodeURIComponent(subjectPrefix + pkgName);
    const emailBody = encodeURIComponent(
      `Hello Amanah Vacations,\n\n${lines}\n\nPlease send me the full quote.\n\nThank you!`
    );
    return {
      wa: `https://wa.me/${WA_NUMBER}?text=${waMsg}`,
      email: `mailto:${EMAIL}?subject=${emailSubject}&body=${emailBody}`,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, modalComment, selectedAddons, recommendedActive, checkin, checkout, adults, kids, kidsAges, accom, accomTier, nights, byoSubmitted]);

  const submitByo = () => {
    if (nights === null || nights < MIN_NIGHTS_BYO) {
      alert(`Please select your check-in and check-out dates (at least ${MIN_NIGHTS_BYO} night) so we can start building your plan.`);
      return;
    }
    const addonStr =
      byoAddons.length > 0
        ? byoAddons
            .map((name) => {
              const a = actsByName[name];
              return a && a.price !== null
                ? `${name} ($${a.price.toLocaleString("en-US")} MXN${a.unit})`
                : `${name} (On Request)`;
            })
            .join(", ")
        : "None yet";
    setByoSubmitted({ addonStr, comment: byoComment.trim() });
    setByoOpen(false);
    setModalComment("");
    setModal({ kind: "byo-result" });
  };

  const links = buildContactLinks();

  /* ── render helpers ── */
  const kidsAgesBlock = (
    <div className={`kids-ages${kids > 0 ? " show" : ""}`}>
      <label>{dict.pkgc_children_ages}</label>
      <div className="ages-row">
        {Array.from({ length: kids }, (_, i) => (
          <select
            key={i}
            className="age-select"
            value={kidsAges[i] ?? ""}
            onChange={(e) =>
              setKidsAges((prev) => {
                const copy = [...prev];
                copy[i] = e.target.value;
                return copy;
              })
            }
          >
            <option value="">{`${dict.pkgc_child_age} ${i + 1}`}</option>
            {Array.from({ length: 18 }, (_, a) => (
              <option key={a} value={a}>
                {a} year{a !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );

  const accomToggleBlock = (
    <div className="accom-toggle">
      <label>{dict.pkgc_accommodation}</label>
      <div className="toggle-row">
        <button className={`toggle-btn${accom ? " active" : ""}`} onClick={() => setAccom(true)}>
          {dict.pkgc_yes_include}
        </button>
        <button className={`toggle-btn${!accom ? " active" : ""}`} onClick={() => setAccom(false)}>
          {dict.pkgc_no_thanks}
        </button>
      </div>
    </div>
  );

  const accomPills = (
    <div className="accom-pills">
      {ACCOM_TIERS.map((t) => (
        <button
          key={t.id}
          className={`accom-pill${accomTier === t.id ? " active" : ""}`}
          onClick={() => setAccomTier(t.id)}
        >
          {t.emoji} {t.label}
        </button>
      ))}
    </div>
  );

  const counters = (
    <>
      <div className="counter-group">
        <label>{dict.pkgc_adults}</label>
        <div className="counter-row">
          <button className="cnt-btn" onClick={() => adjust("adults", -1)}>−</button>
          <span className="cnt-num">{adults}</span>
          <button className="cnt-btn" onClick={() => adjust("adults", 1)}>+</button>
        </div>
      </div>
      <div className="counter-group">
        <label>{dict.pkgc_children}</label>
        <div className="counter-row">
          <button className="cnt-btn" onClick={() => adjust("kids", -1)}>−</button>
          <span className="cnt-num">{kids}</span>
          <button className="cnt-btn" onClick={() => adjust("kids", 1)}>+</button>
        </div>
      </div>
    </>
  );

  const addonItem = (act: Activity, pkgId: PkgId) => {
    const selected = selectedAddons[pkgId].includes(act.name);
    return (
      <div
        key={act.id}
        className={`addon-item${selected ? " selected" : ""}`}
        onClick={() => toggleAddon(pkgId, act.name)}
      >
        <div className="addon-cb">{selected ? "✓" : ""}</div>
        <span className="addon-item-name">
          {act.emoji} {act.name}{" "}
          <span className="info-icon" data-tip={act.desc} onClick={(e) => e.stopPropagation()}>
            i
          </span>
        </span>
        {act.price === null ? (
          <span className="addon-onreq">{dict.pkgc_on_request}</span>
        ) : !act.inCart ? (
          <>
            <span className="addon-item-price">
              {format(act.price)}{act.unit}
            </span>{" "}
            <span className="addon-onreq">{dict.pkgc_booked_via_contact}</span>
          </>
        ) : act.groupPrices ? (
          /* Tiered add-on: live per-person rate for the current group
             (flat total when it's one fixed price, e.g. the dinner). */
          (() => {
            const n = Math.max(1, adults + kids);
            const total = tourTotalFor(act, n) ?? 0;
            const flat = Object.keys(act.groupPrices!).length === 1 && act.groupPrices![1] !== undefined;
            return (
              <span className="addon-item-price">
                {flat ? format(total) : `${format(Math.round(total / n))}${dict.pkgc_per_person}`}
              </span>
            );
          })()
        ) : (
          <span className="addon-item-price">
            {format(act.price)}{act.unit}
          </span>
        )}
      </div>
    );
  };

  /* Grouped add-on panel (trial on The Basics): always-visible category
     headers — chunking without extra clicks — with every on-request item
     collected into the last group so the buyable list stays undiluted. */
  const groupedAddonPanel = (pkgId: PkgId) => {
    const groups: { key: string; label: string; items: Activity[] }[] = [
      { key: "tours", label: dict.pkgc_cat_tours, items: [] },
      { key: "parks", label: dict.pkgc_cat_parks, items: [] },
      { key: "special", label: dict.pkgc_cat_special, items: [] },
      { key: "onreq", label: dict.pkgc_cat_onreq, items: [] },
    ];
    activities.forEach((act) => {
      const key = act.price === null ? "onreq" : ADDON_CATEGORY[act.id] ?? "special";
      groups.find((g) => g.key === key)!.items.push(act);
    });
    return (
      <div className={`addons-panel${openAddonPanels[pkgId] ? " open" : ""}`}>
        <div className="addon-note">
          {dict.pkgc_addon_note}
        </div>
        {groups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <div key={g.key} className="addon-cat">
              <div className="addon-cat-header">{g.label}</div>
              {g.items.map((act) => addonItem(act, pkgId))}
            </div>
          ))}
      </div>
    );
  };

  const addonPanel = (pkgId: PkgId) =>
    pkgId === "basic" ? (
      groupedAddonPanel(pkgId)
    ) : (
      <div className={`addons-panel${openAddonPanels[pkgId] ? " open" : ""}`}>
        <div className="addon-note">
          {dict.pkgc_addon_note}
        </div>
        {activities.map((act) => addonItem(act, pkgId))}
      </div>
    );

  const pkgNightsText = nights !== null && checkin && checkout ? (
    <>
      <strong>
        {nights} night{nights !== 1 ? "s" : ""}
      </strong>
      {accom ? " · With hotel" : " · No hotel"}
    </>
  ) : (
    "—"
  );

  const renderPkgCard = (pkgId: PkgId) => {
    const meta = pkgMeta[pkgId];
    const rec = RECOMMENDED[pkgId];
    const recTip = REC_TIPS[pkgId];
    const minPeople = MIN_PEOPLE[pkgId] || 1;
    const peopleOK = adults + kids >= minPeople;
    const valid = nightsOK && peopleOK;
    return (
      <div key={pkgId} className={`pkg-card ${pkgId}${highlighted === pkgId ? " pkg-highlight" : ""}`}>
        <div className="pkg-photo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pkg-photo" src={meta.photo} alt={`${meta.name} — ${meta.tagline}`} />
          <div className="pkg-badge">{meta.badge}</div>
        </div>
        <div className="pkg-header">
          <div className="pkg-icon-wrap">{meta.icon}</div>
          <div className="pkg-name">{meta.name}</div>
          <div className="pkg-tagline">{meta.tagline}</div>
          <div className="pkg-min-stay">{dict.pkgc_min_stay}</div>
          <div className="pkg-min-people">
            {pkgId === "honeymoon"
              ? dict.pkgc_only_two
              : (MIN_PEOPLE[pkgId] ?? 1) > 1
                ? dict.pkgc_min_people
                : dict.pkgc_min_people_2}
          </div>
        </div>
        <div className="pkg-body">
          <div className="pkg-includes-title">{dict.pkgc_whats_included}</div>
          <ul className="pkg-includes">
            {meta.includes.map((inc) => (
              <li key={inc.slice(0, 30)} className="pkg-include-item">
                <span className="pkg-check">✓</span>
                {inc}
              </li>
            ))}
          </ul>
          {DETAILS[pkgId] && (
            <button
              type="button"
              className="pkg-see-details"
              onClick={() => setDetailsPkg(pkgId)}
            >
              {dict.pkgc_see_details} →
            </button>
          )}
        </div>
        {rec && recTip && (
          <div className="choice-box">
            <div className="choice-label">{dict.pkgc_recommended_addon}</div>
            <div className="choice-pills">
              <button
                className={`choice-pill${recommendedActive[pkgId] ? " active" : ""}`}
                onClick={() => toggleRecommend(pkgId)}
              >
                <span className="rec-icon-label">{recTip.label}</span>
                <span className="info-icon" data-tip={recTip.tip} onClick={(e) => e.stopPropagation()}>
                  i
                </span>
                <span className="rec-price">
                  {recommendedActive[pkgId] ? dict.pkgc_added : `+${format(rec.price)}${dict.pkgc_per_person}`}
                </span>
              </button>
            </div>
          </div>
        )}
        {/* ONE price on the card: the TOTAL the group actually pays (updates
            live with travelers + add-ons), with the per-person rate as a small
            helper underneath — no competing numbers. */}
        <div className="pkg-price-area">
          <div>
            <div className="pkg-price-label">
              {dict.pkgc_total_label} ·{" "}
              {pkgId === "honeymoon"
                ? dict.pkgc_for_two
                : `${tierUsed(pkgId).pax} ${tierUsed(pkgId).pax === 1 ? dict.pkgc_traveler : dict.pkgc_travelers}`}
            </div>
            <div className="pkg-price">{format(displayTotalMXN(pkgId))}</div>
            <div className="pkg-price-pp">
              {dict.pkgc_approx} {format(Math.round(displayTotalMXN(pkgId) / tierUsed(pkgId).pax))}
              {dict.pkgc_per_person}
            </div>
          </div>
          <div className="pkg-nights">{pkgNightsText}</div>
        </div>
        <button
          className={`addons-toggle${openAddonPanels[pkgId] ? " open" : ""}`}
          onClick={() => setOpenAddonPanels((p) => ({ ...p, [pkgId]: !p[pkgId] }))}
        >
          <span className="addons-toggle-label">
            {pkgId === "basic" ? (
              /* Trial (The Basics): one clear line — what it is AND what it
                 does — plus the count as a curiosity hook. */
              <span className="addons-toggle-line1">
                {dict.pkgc_make_unforgettable} — {dict.pkgc_add_experiences_inline} ({activities.length})
              </span>
            ) : (
              <>
                <span className="addons-toggle-line1">{dict.pkgc_make_unforgettable}</span>
                <span className="addons-toggle-line2">{dict.pkgc_add_experiences}</span>
              </>
            )}
          </span>
          <span className="addons-toggle-icon">+</span>
        </button>
        {addonPanel(pkgId)}
        <div className="pkg-cta">
          <div className="pkg-cta-row">
            <button
              className={`cta-btn-sm cta-buy${valid ? "" : " btn-disabled"}`}
              disabled={!valid}
              onClick={() => buyNow(pkgId, meta.name)}
            >
              {dict.pkgc_buy_now}
            </button>
            <button
              className="cta-btn-sm cta-contact"
              onClick={() => {
                setModalComment("");
                setModal({ kind: "quote", pkgId, pkgName: meta.name });
              }}
            >
              {dict.pkgc_contact_us}
            </button>
          </div>
          <div className="private-badge">{dict.pkgc_private_badge}</div>
        </div>
      </div>
    );
  };

  const modalSummaryRows = () => {
    if (!modal) return null;
    if (modal.kind === "quote") {
      const addons = [...(selectedAddons[modal.pkgId] ?? [])];
      const rec = RECOMMENDED[modal.pkgId];
      if (rec && recommendedActive[modal.pkgId])
        addons.push(`${rec.name} (+${format(rec.price)}/person)`);
      const addonStr = addons.length > 0 ? addons.join(", ") : dict.pkgc_none;
      const mxn = priceMXN(modal.pkgId);
      return (
        <>
          <div className="modal-summary-title">{dict.pkgc_booking_summary}</div>
          <Row lbl={dict.pkgc_package} val={modal.pkgName} />
          <Row lbl={dict.pkgc_checkin} val={fmtDate(checkin)} />
          <Row lbl={dict.pkgc_checkout} val={fmtDate(checkout)} />
          <Row lbl={dict.pkgc_duration} val={`${nights === null ? "—" : nights} ${dict.pkgc_nights}`} />
          <Row lbl={dict.pkgc_adults} val={String(adults)} />
          <Row lbl={dict.pkgc_children} val={kids > 0 ? `${kids} (${getKidsAgesText()})` : dict.pkgc_none} />
          <Row lbl={dict.pkgc_accommodation} val={accom ? `✅ ${accomText()}` : `❌ ${dict.pkgc_not_needed}`} />
          <Row lbl={dict.pkgc_addons_selected} val={addonStr} />
          <div className="modal-price-row">
            <span className="lbl">{dict.pkgc_estimated_base}</span>
            <span className="modal-price-total">
              {format(mxn)}{dict.pkgc_per_person}
            </span>
          </div>
        </>
      );
    }
    if (modal.kind === "vip") {
      return (
        <>
          <div className="modal-summary-title">{dict.pkgc_your_details}</div>
          <Row lbl={dict.pkgc_plan} val={modal.pkgName} />
          <Row lbl={dict.pkgc_checkin} val={fmtDate(checkin)} />
          <Row lbl={dict.pkgc_checkout} val={fmtDate(checkout)} />
          <Row lbl={dict.pkgc_adults} val={String(adults)} />
          <Row lbl={dict.pkgc_children} val={kids > 0 ? `${kids} (${getKidsAgesText()})` : dict.pkgc_none} />
        </>
      );
    }
    const s = byoSubmitted;
    return (
      <>
        <div className="modal-summary-title">{dict.pkgc_your_trip_details}</div>
        <Row lbl={dict.pkgc_checkin} val={fmtDate(checkin)} />
        <Row lbl={dict.pkgc_checkout} val={fmtDate(checkout)} />
        <Row lbl={dict.pkgc_adults} val={String(adults)} />
        <Row lbl={dict.pkgc_children} val={kids > 0 ? `${kids} (${getKidsAgesText()})` : dict.pkgc_none} />
        <Row lbl={dict.pkgc_accommodation} val={accom ? `✅ ${accomText()}` : `❌ ${dict.pkgc_not_needed}`} />
        <Row lbl={dict.pkgc_activities_interest} val={s?.addonStr ?? dict.pkgc_none} />
        {s?.comment ? <Row lbl={dict.pkgc_notes} val={s.comment} /> : null}
      </>
    );
  };

  return (
    <main>
      {/* SECTION HEADER */}
      <div className="section-header">
        <div className="s-label">
          <div className="s-label-line" />
          {dict.pkgc_section_label}
          <div className="s-label-line" />
        </div>
        <h1 className="s-title">
          {dict.pkgc_title_1} <em>{dict.pkgc_title_em}</em>
        </h1>
        <p className="s-sub">
          {dict.pkgc_sub_1}<br />
          {dict.pkgc_sub_2}
        </p>
      </div>

      {/* INPUT BAR */}
      <div className="input-bar">
        <div className="input-group">
          <label>{dict.pkgc_checkin}</label>
          <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </div>
        <div className="input-group">
          <label>{dict.pkgc_checkout}</label>
          <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        {counters}
        {kidsAgesBlock}
        {accomToggleBlock}
      </div>

      {/* MIN NIGHTS HINT */}
      <div className={`dates-hint${!nightsOK ? " show" : ""}`}>
        {dict.pkgc_dates_hint}
      </div>

      {/* ACCOMMODATION OPTIONS */}
      <div className={`accom-options-bar${accom ? " show" : ""}`}>
        <span className="accom-options-label">{dict.pkgc_preferred_stay}</span>
        {accomPills}
      </div>

      {/* PACKAGES GRID */}
      <div className="packages-wrap">
        <div className="packages-grid" ref={gridRef}>
          {PACKAGE_IDS.map((id) => renderPkgCard(id))}

          {/* VIP */}
          <div className={`pkg-card vip vip-card${highlighted === "vip" ? " pkg-highlight" : ""}`}>
            <div className="pkg-photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pkg-photo" src="/images/pkg/vip.jpg" alt="VIP Plan — Luxury & Total Freedom" />
              <div className="pkg-badge">Premium</div>
            </div>
            <div className="pkg-header">
              <div className="pkg-icon-wrap">✦</div>
              <div className="pkg-name">{dict.pkgc_vip_name}</div>
              <div className="pkg-tagline">{dict.pkgc_vip_tagline}</div>
              <div className="pkg-min-stay">{dict.pkgc_min_stay}</div>
            </div>
            <div className="pkg-body">
              <div className="pkg-includes-title">{dict.pkgc_whats_included}</div>
              <ul className="pkg-includes">
                {[
                  dict.pkgc_vip_inc1,
                  dict.pkgc_vip_inc2,
                  dict.pkgc_vip_inc3,
                  dict.pkgc_vip_inc4,
                  dict.pkgc_vip_inc5,
                  dict.pkgc_vip_inc6,
                  dict.pkgc_vip_inc7,
                ].map((inc) => (
                  <li key={inc} className="pkg-include-item">
                    <span className="pkg-check">✓</span>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="pkg-customize">{dict.pkgc_vip_customize}</p>
            </div>
            <div className="pkg-price-area">
              <div>
                <div className="pkg-price-label">{dict.pkgc_starting_from}</div>
                <div className="pkg-price" style={{ color: "#B87A20" }}>
                  {dict.pkgc_on_request_price}
                </div>
              </div>
              <div className="pkg-nights">{dict.pkgc_tailored}</div>
            </div>
            <div className="pkg-cta" style={{ paddingTop: 16 }}>
              <button
                className="cta-btn gold"
                onClick={() => {
                  setModalComment("");
                  setModal({ kind: "vip", pkgName: dict.pkgc_vip_name });
                }}
              >
                {dict.pkgc_get_custom_quote}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BUILD YOUR OWN BANNER */}
      <div className="byo-banner">
        <div className="byo-left">
          <div className="byo-eyebrow">
            <div className="byo-eyebrow-line" />
            {dict.pkgc_byo_eyebrow}
          </div>
          <div className="byo-title">
            {dict.pkgc_byo_title_1} <em>{dict.pkgc_byo_title_em}</em>
          </div>
          <div className="byo-sub">
            {dict.pkgc_byo_sub}
          </div>
        </div>
        <div className="byo-right">
          <button className="byo-btn" onClick={() => setByoOpen(true)}>
            {dict.pkgc_byo_btn}
          </button>
          <div className="byo-count">{dict.pkgc_byo_count}</div>
        </div>
      </div>

      {/* PACKAGE DETAILS MODAL — day-by-day description of what's inside */}
      <div
        className={`pkg-modal-overlay${detailsPkg ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDetailsPkg(null);
        }}
      >
        {detailsPkg && DETAILS[detailsPkg] && (
          <div className="modal pkg-details-modal">
            <div className="modal-head">
              <div className="modal-title">
                {pkgMeta[detailsPkg].icon} {pkgMeta[detailsPkg].name}
              </div>
              <button className="modal-close" onClick={() => setDetailsPkg(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="pkg-details-intro">{DETAILS[detailsPkg]!.intro}</p>
              {DETAILS[detailsPkg]!.days.map((day) => (
                <div key={day.title.slice(0, 30)} className="pkg-details-day">
                  <div className="pkg-details-day-title">{day.title}</div>
                  <div className="pkg-details-day-dur">{day.dur}</div>
                  <p className="pkg-details-day-desc">{day.desc}</p>
                  <div className="pkg-details-day-inc">
                    <strong>{dict.pkgc_details_included}</strong> {day.included}
                  </div>
                </div>
              ))}
              {DETAILS[detailsPkg]!.addonNote && (
                <div className="pkg-details-addon">{DETAILS[detailsPkg]!.addonNote}</div>
              )}
              <div className="pkg-details-week">
                <div className="pkg-details-week-title">{dict.pkgc_details_week}</div>
                <ol className="pkg-details-week-list">
                  {DETAILS[detailsPkg]!.week.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
                <p className="pkg-details-week-note">{DETAILS[detailsPkg]!.weekNote}</p>
              </div>
              <div className="modal-buttons">
                <button
                  className="modal-wa-btn"
                  style={{ border: 0, cursor: "pointer" }}
                  onClick={() => setDetailsPkg(null)}
                >
                  {dict.pkgc_details_close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUOTE / CONTACT / BYO-RESULT MODAL */}
      <div
        className={`pkg-modal-overlay${modal ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        {modal && (
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">
                {modal.kind === "quote"
                  ? `${modal.pkgName} — ${dict.pkgc_contact_suffix}`
                  : modal.kind === "vip"
                    ? `${modal.pkgName} — ${dict.pkgc_custom_quote}`
                    : dict.pkgc_byo_quote_request}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-summary">{modalSummaryRows()}</div>
              {modal.kind === "quote" && accom && (
                <div className="modal-note">
                  {dict.pkgc_note_accom}
                </div>
              )}
              {modal.kind === "vip" && (
                <div className="modal-note">
                  {dict.pkgc_note_vip}
                </div>
              )}
              {modal.kind === "byo-result" && (
                <div className="modal-note">
                  {dict.pkgc_note_byo}
                </div>
              )}
              {modal.kind !== "byo-result" && (
                <>
                  <label className="modal-comment-label">{dict.pkgc_anything_else}</label>
                  <textarea
                    className="modal-comment"
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder={dict.pkgc_anything_else_ph}
                  />
                </>
              )}
              <div className="modal-buttons">
                <a className="modal-wa-btn" href={links.wa} target="_blank" rel="noopener noreferrer">
                  {WA_ICON} {dict.pkgc_send_wa}
                </a>
                <a className="modal-email-btn" href={links.email}>
                  {dict.pkgc_send_email}
                </a>
              </div>
              <div className="modal-cancel" onClick={() => setModal(null)}>
                {dict.pkgc_go_back}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BUILD YOUR OWN MODAL */}
      <div
        className={`pkg-modal-overlay${byoOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setByoOpen(false);
        }}
      >
        {byoOpen && (
          <div className="byo-modal">
            <div className="byo-modal-head">
              <div className="byo-modal-title-wrap">
                <div className="byo-modal-title">{dict.pkgc_byo_modal_title}</div>
                <div className="byo-modal-sub">
                  {dict.pkgc_byo_modal_sub}
                </div>
              </div>
              <button className="modal-close" onClick={() => setByoOpen(false)}>
                ×
              </button>
            </div>
            <div className="byo-modal-body">
              <div className="byo-controls">
                <div className="byo-controls-title">{dict.pkgc_your_trip_details}</div>
                <div className="byo-ctrl-row">
                  <div className="input-group">
                    <label>{dict.pkgc_checkin}</label>
                    <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>{dict.pkgc_checkout}</label>
                    <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
                  </div>
                </div>
                <div className="byo-ctrl-row">
                  {counters}
                  <div className="accom-toggle" style={{ flex: 1 }}>
                    <label>{dict.pkgc_accommodation}</label>
                    <div className="toggle-row">
                      <button className={`toggle-btn${accom ? " active" : ""}`} onClick={() => setAccom(true)}>
                        {dict.pkgc_yes}
                      </button>
                      <button className={`toggle-btn${!accom ? " active" : ""}`} onClick={() => setAccom(false)}>
                        {dict.pkgc_no}
                      </button>
                    </div>
                  </div>
                </div>
                {kidsAgesBlock}
                <div className={`accom-options-bar accom-options-inline${accom ? " show" : ""}`}>
                  <span className="accom-options-label">{dict.pkgc_preferred_stay}</span>
                  {accomPills}
                </div>
                <button
                  className={`addons-toggle${byoAddonsOpen ? " open" : ""}`}
                  onClick={() => setByoAddonsOpen((v) => !v)}
                  style={{ margin: 0, width: "100%" }}
                >
                  <span className="addons-toggle-label">{dict.pkgc_byo_browse}</span>
                  <span className="addons-toggle-icon">+</span>
                </button>
                <div className={`addons-panel${byoAddonsOpen ? " open" : ""}`} style={{ padding: byoAddonsOpen ? "12px 0 0" : 0, borderTop: "none", background: "transparent" }}>
                  <div className="addon-note">
                    {dict.pkgc_byo_addon_note}
                  </div>
                  {activities.map((act) => {
                    const selected = byoAddons.includes(act.name);
                    return (
                      <div
                        key={act.id}
                        className={`addon-item${selected ? " selected" : ""}`}
                        onClick={() =>
                          setByoAddons((prev) =>
                            prev.includes(act.name)
                              ? prev.filter((n) => n !== act.name)
                              : [...prev, act.name]
                          )
                        }
                      >
                        <div className="addon-cb">{selected ? "✓" : ""}</div>
                        <span className="addon-item-name">
                          {act.emoji} {act.name}{" "}
                          <span className="info-icon" data-tip={act.desc} onClick={(e) => e.stopPropagation()}>
                            i
                          </span>
                        </span>
                        {act.price === null ? (
                          <span className="addon-onreq">{dict.pkgc_on_request}</span>
                        ) : (
                          <span className="addon-item-price">
                            {format(act.price)}{act.unit}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <label className="modal-comment-label">{dict.pkgc_dreaming_label}</label>
              <textarea
                className="modal-comment"
                value={byoComment}
                onChange={(e) => setByoComment(e.target.value)}
                placeholder={dict.pkgc_dreaming_ph}
              />
              <button className="byo-continue-btn" onClick={submitByo}>
                {dict.pkgc_byo_continue}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ lbl, val }: { lbl: string; val: string }) {
  return (
    <div className="modal-summary-row">
      <span className="lbl">{lbl}</span>
      <span className="val">{val}</span>
    </div>
  );
}

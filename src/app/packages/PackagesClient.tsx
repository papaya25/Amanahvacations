"use client";

/* Ported from Maher's Wix packages embed. All business logic (pricing engine,
   gating rules, checkout URL params, WhatsApp/email quote generation) is kept
   intact — only the rendering moved from DOM manipulation to React state. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

/* ── CONFIG ── */
const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";
const CURRENCY = "MXN";
const MIN_NIGHTS_PACKAGE = 3;
const MIN_NIGHTS_BYO = 1;

const ACCOM_TIERS = [
  { id: "4-star", emoji: "🏨", label: "4-Star Hotel" },
  { id: "5-star", emoji: "✨", label: "5-Star Hotel" },
  { id: "all-inclusive", emoji: "🍽️", label: "All-Inclusive" },
  { id: "airbnb", emoji: "🏡", label: "Airbnb / Villa" },
];

type Activity = {
  id: string;
  name: string;
  emoji: string;
  price: number | null;
  unit: string;
  inCart: boolean;
  desc: string;
};

const ACTIVITIES: Activity[] = [
  { id: "chichen", name: "Chichén + Valladolid", emoji: "🏛️", price: 6600, unit: "/person", inCart: true, desc: "Round-trip private transportation, entrance with a private guide to Chichén Itzá — a Wonder of the World — a stop in colonial Valladolid, plus swimming in nearby cenotes." },
  { id: "tulumcenotes", name: "Tulum & Cenotes Tour", emoji: "🌊", price: 3700, unit: "/person", inCart: true, desc: "Private transportation, a guided walk through the clifftop Tulum ruins above the Caribbean, plus a refreshing cenote stop." },
  { id: "cobacenotes", name: "Cobá & Cenotes Tour", emoji: "🏛️", price: 3900, unit: "/person", inCart: true, desc: "Round-trip private transportation to Cobá — an ancient Maya city in the jungle, crowned by Nohoch Mul, the tallest pyramid on the Peninsula — with a guide, entrance fees, refreshments and cenote stops." },
  { id: "akumaltulum", name: "Tulum + Akumal", emoji: "🐢", price: 5850, unit: "/person", inCart: true, desc: "Two experiences in one day: the Tulum ruins and Akumal, snorkeling in the natural habitat of sea turtles. Includes private transportation." },
  { id: "akumalcenotes", name: "Akumal & Cenotes Tour", emoji: "🐢", price: 2350, unit: "/person", inCart: true, desc: "Snorkel with sea turtles in Akumal and cool off in a cenote — private transportation, free drinks, and a boat to the turtle habitat included." },
  { id: "cancun", name: "Cancún City Tour", emoji: "🏙️", price: 800, unit: "/person", inCart: true, desc: "Private transportation touring Cancún, including the Zona Hotelera and a stop at one of the best spots on the Caribbean Sea, with the option to swim." },
  { id: "quinta", name: "Quinta Av Guided Tour", emoji: "🛍️", price: 500, unit: "/person", inCart: true, desc: "A private guided walk down the charming Quinta Avenida in Playa del Carmen, with stops at recommended shops and restaurants." },
  { id: "aquarium", name: "Cancún Aquarium", emoji: "🐠", price: 950, unit: "/person", inCart: true, desc: "Private transportation and entrance to the Cancún Aquarium — explore an incredible underwater world without getting wet. Upgrades available for aquarium trek, dolphin shows, and private swims with dolphins. Free for children 0–4." },
  { id: "cozumel", name: "Cozumel Private Tour", emoji: "⛵", price: 4600, unit: "/person", inCart: true, desc: "A private tour of Cozumel by private boat — reefs, beaches and the island at your own pace." },
  { id: "rutacenotes", name: "Ruta de los Cenotes Tour", emoji: "💧", price: 2900, unit: "/person", inCart: true, desc: "A full cenote route — four different cenotes (two open-air, two underground) with a diving platform and water zip line. Includes hammock area, life jackets, lockers, parking and showers." },
  { id: "cenotevisit", name: "Cenote Visit", emoji: "💦", price: 1000, unit: "/person", inCart: true, desc: "A visit to one beautiful cenote — perfect for a refreshing swim in crystal-clear water." },
  { id: "aquariumcontoy", name: "Isla Contoy", emoji: "🦅", price: null, unit: "", inCart: false, desc: "A private excursion to the protected paradise of Isla Contoy — arranged personally with you, priced per group." },
  { id: "whalesharks", name: "Whale Sharks Tour", emoji: "🐋", price: null, unit: "", inCart: false, desc: "A seasonal encounter swimming alongside the world's largest fish. Availability depends on the season — our team will confirm dates for you." },
  { id: "yacht", name: "Private Yacht", emoji: "⛵", price: null, unit: "", inCart: false, desc: "A private yacht charter tailored to your group — pricing depends on the number of hours and type of tour you'd like." },
  { id: "siankaan", name: "Sian Ka'an", emoji: "🌿", price: null, unit: "", inCart: false, desc: "A boat journey through the ancient Maya canals of the Sian Ka'an Biosphere Reserve — availability depends on the day, our team will confirm." },
  { id: "zipline", name: "Zipline & ATV", emoji: "⚡", price: null, unit: "", inCart: false, desc: "A jungle adventure combining zipline and ATV riding — availability depends on the day, our team will confirm." },
  { id: "photoshoot", name: "Photoshoot", emoji: "📸", price: null, unit: "", inCart: false, desc: "A professional photoshoot at one of the region's most beautiful locations — fully tailored to your occasion." },
  { id: "dinner", name: "Romantic Dinner", emoji: "🌅", price: null, unit: "", inCart: false, desc: "A private romantic dinner set up in a stunning location, arranged around your preferences and special occasion." },
  { id: "bacalar", name: "Bacalar Lagoon", emoji: "💙", price: null, unit: "", inCart: false, desc: "A day trip to the \"Lagoon of Seven Colors\" — Mexico's breathtaking turquoise lake. Our team will tailor the details with you." },
  { id: "xcaret", name: "Xcaret Park", emoji: "🌺", price: 3500, unit: "/person", inCart: true, desc: "A full day at Xcaret, an eco-archaeological park blending underground rivers, wildlife encounters, cultural shows and Maya history." },
  { id: "xelha", name: "Xel-Há Park", emoji: "🎢", price: 2850, unit: "/person", inCart: true, desc: "An all-inclusive natural aquatic park — snorkel a lagoon fed by underground rivers, cliff-jump, and relax on the beach, all included." },
  { id: "xplor", name: "Xplor Park", emoji: "🌴", price: 3350, unit: "/person", inCart: true, desc: "An adrenaline-packed adventure park through the jungle — zipline circuits, amphibious vehicles, rafts on underground rivers, and stalactite caves." },
  { id: "xplorfuego", name: "Xplor Fuego", emoji: "🔥", price: 2850, unit: "/person", inCart: true, desc: "The nighttime edition of Xplor — the same jungle adventure circuits illuminated after dark for a completely different thrill. Open 5:30 PM – 11:00 PM." },
  { id: "xsenses", name: "Xenses Park", emoji: "✨", price: 1850, unit: "/person", inCart: true, desc: "A sensory adventure park challenging your five senses through jungle trails, ziplines, and unique perception experiences." },
  { id: "monkey", name: "Monkey Sanctuary", emoji: "🐒", price: 1900, unit: "/person", inCart: true, desc: "A visit to a monkey sanctuary — get close to rescued wildlife in a natural, protected setting." },
  { id: "tennis", name: "Tennis Lessons", emoji: "🎾", price: 800, unit: "/hour/person", inCart: false, desc: "Private tennis lessons with a local instructor, billed per hour, per person. Our team will confirm hours and charge separately." },
];

const ACTS_BY_NAME: Record<string, Activity> = {};
ACTIVITIES.forEach((a) => (ACTS_BY_NAME[a.name] = a));

const PACKAGE_IDS = ["basic", "family", "water", "explorer", "honeymoon"] as const;
type PkgId = (typeof PACKAGE_IDS)[number];

const PRICES: Record<PkgId, number> = {
  basic: 4600,
  family: 8200,
  water: 7600,
  explorer: 11850,
  honeymoon: 14300,
};
const MIN_PEOPLE: Partial<Record<PkgId, number>> = { family: 3 };
const USD_RATE = 17;

const RECOMMENDED: Partial<Record<PkgId, { id: string; name: string; price: number }>> = {
  basic: { id: "xcaret", name: "Xcaret Park", price: 3500 },
  water: { id: "xelha", name: "Xel-Há Park", price: 2850 },
  explorer: { id: "xplorfuego", name: "Xplor Fuego", price: 2850 },
  honeymoon: { id: "holbox", name: "Holbox Overnight", price: 7800 },
};

const PKG_META: Record<
  PkgId,
  { name: string; tagline: string; badge: string; icon: string; photo: string; includes: string[] }
> = {
  basic: {
    name: "The Basics",
    tagline: "Essential Riviera Maya",
    badge: "Essential",
    icon: "🌿",
    photo: "/images/pkg/basic.jpg",
    includes: [
      "Private airport transfers Cancún ↔ PDC + welcome brochure",
      "Cenote visit",
      "Snorkeling in Playa del Carmen",
      "Beach Club Xpu-Ha",
      "Guided Quinta Avenida tour",
      "Personal WhatsApp concierge",
    ],
  },
  family: {
    name: "Family Tour",
    tagline: "Kid-Friendly Riviera Maya",
    badge: "Kid-Friendly",
    icon: "👨‍👩‍👧‍👦",
    photo: "/images/pkg/family.jpg",
    includes: [
      "Private airport transfers Cancún ↔ PDC + welcome brochure",
      "Tulum Ruins & City Tour",
      "Cenotes Tour",
      "Cancún Aquarium",
      "Xenses Park or Monkey Sanctuary — you choose",
      "Personal WhatsApp concierge",
    ],
  },
  water: {
    name: "Water Lovers",
    tagline: "Beaches, Reefs & Cenotes",
    badge: "Water & Reef",
    icon: "🌊",
    photo: "/images/pkg/water.jpg",
    includes: [
      "Private airport transfers Cancún ↔ PDC + welcome brochure",
      "Akumal day trip — snorkeling with sea turtles",
      "Cenotes Tour — 4 different cenotes, water zip line & diving platform",
      "Snorkeling in Playa del Carmen",
      "Personal WhatsApp concierge",
    ],
  },
  explorer: {
    name: "Indiana Jones",
    tagline: "Culture & Wonders",
    badge: "Culture & Wonders",
    icon: "🏛️",
    photo: "/images/pkg/explorer.jpg",
    includes: [
      "Private airport transfers Cancún ↔ PDC + welcome brochure",
      "Chichén Itzá full day — guided visit to a Wonder of the World",
      "Valladolid stop — colonial streets & cenote",
      "Tulum ruins day trip — clifftop Maya ruins above the sea",
      "Cenote Dos Ojos stop",
      "Playa del Carmen Explorer Tour",
      "Personal WhatsApp concierge",
    ],
  },
  honeymoon: {
    name: "Honeymoon Escape",
    tagline: "Romance & Intimacy",
    badge: "Couples",
    icon: "💞",
    photo: "/images/pkg/honeymoon.jpg",
    includes: [
      "Private airport transfers Cancún ↔ PDC + welcome brochure",
      "Cozumel private tour by private boat",
      "Isla Contoy day trip",
      "Romantic dinner",
      "Quinta Avenida stroll & discovery",
      "Xcaret Park",
      "Personal WhatsApp concierge",
    ],
  },
};

const REC_TIPS: Partial<Record<PkgId, { label: string; tip: string }>> = {
  basic: { label: "🌺 Xcaret Park", tip: "Round out your trip with a full day at Xcaret — an eco-archaeological park blending underground rivers, wildlife encounters and Maya history." },
  water: { label: "🎢 Xel-Há Park", tip: "An all-inclusive natural aquatic park — snorkel a lagoon fed by underground rivers, cliff-jump, and relax on the beach, all included." },
  explorer: { label: "🔥 Xplor Fuego Park", tip: "The nighttime edition of Xplor — the same jungle adventure circuits illuminated after dark for a completely different thrill. Open 5:30 PM – 11:00 PM." },
  honeymoon: { label: "🦩 Holbox Romantic Night", tip: "A night away on magical Holbox Island — hotel stay and a romantic dinner on the beach included." },
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

export default function PackagesClient() {
  const router = useRouter();
  const { add } = useCart();

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
  const [familyChoice, setFamilyChoice] = useState("Xenses Park");
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

  const getKidsAgesText = () => {
    if (kids === 0) return "None";
    return kidsAges
      .map((v, i) => (v !== "" && v != null ? `Child ${i + 1}: ${v}yr` : `Child ${i + 1}: age not set`))
      .join(", ");
  };

  const priceMXN = (id: PkgId) => {
    let mxn = PRICES[id];
    const rec = RECOMMENDED[id];
    if (rec && recommendedActive[id]) mxn += rec.price;
    return mxn;
  };

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

  const packageTotalMXN = (pkgId: PkgId) => {
    const n = adults + kids;
    const mult = pkgId === "honeymoon" ? 2 : n;
    return PRICES[pkgId] * mult;
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
      (name) => ACTS_BY_NAME[name] && ACTS_BY_NAME[name].price !== null && ACTS_BY_NAME[name].inCart
    );
    const humanAddons = addonNames.filter(
      (name) => !ACTS_BY_NAME[name] || ACTS_BY_NAME[name].price === null || !ACTS_BY_NAME[name].inCart
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
    let addonsTotal = cartAddons.reduce((sum, name) => sum + (ACTS_BY_NAME[name].price as number) * n, 0);
    const cartAddonIdList = cartAddons.map((name) => ACTS_BY_NAME[name].id);
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
    if (pkgId === "family") details.push(`Choice: ${familyChoice}`);
    if (cartAddons.length) details.push(`Add-ons: ${cartAddons.join(", ")}`);
    if (humanAddons.length) details.push(`On request: ${humanAddons.join(", ")}`);

    add({
      kind: "package",
      title: pkgName,
      subtitle: PKG_META[pkgId].tagline,
      image: PKG_META[pkgId].photo,
      details,
      total,
      people: n,
      meta: {
        pkgId,
        experience,
        family_choice: pkgId === "family" ? familyChoice : "",
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
    router.push("/checkout");
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
        addons.push(`${rec.name} (+$${rec.price.toLocaleString("en-US")} MXN/person)`);
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
              const a = ACTS_BY_NAME[name];
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
      <label>Children Ages</label>
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
            <option value="">{`Child ${i + 1} age`}</option>
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
      <label>Accommodation</label>
      <div className="toggle-row">
        <button className={`toggle-btn${accom ? " active" : ""}`} onClick={() => setAccom(true)}>
          Yes, include it
        </button>
        <button className={`toggle-btn${!accom ? " active" : ""}`} onClick={() => setAccom(false)}>
          No thanks
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
        <label>Adults</label>
        <div className="counter-row">
          <button className="cnt-btn" onClick={() => adjust("adults", -1)}>−</button>
          <span className="cnt-num">{adults}</span>
          <button className="cnt-btn" onClick={() => adjust("adults", 1)}>+</button>
        </div>
      </div>
      <div className="counter-group">
        <label>Children</label>
        <div className="counter-row">
          <button className="cnt-btn" onClick={() => adjust("kids", -1)}>−</button>
          <span className="cnt-num">{kids}</span>
          <button className="cnt-btn" onClick={() => adjust("kids", 1)}>+</button>
        </div>
      </div>
    </>
  );

  const addonPanel = (pkgId: PkgId) => (
    <div className={`addons-panel${openAddonPanels[pkgId] ? " open" : ""}`}>
      <div className="addon-note">
        Hand-picked experiences to round out your trip. Tap the ⓘ next to any activity for details.
        Items marked &quot;On Request&quot; are arranged personally with you — no payment needed now.
      </div>
      {ACTIVITIES.map((act) => {
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
              <span className="addon-onreq">On Request</span>
            ) : !act.inCart ? (
              <>
                <span className="addon-item-price">
                  ${act.price.toLocaleString("en-US")} MXN{act.unit}
                </span>{" "}
                <span className="addon-onreq">Booked via Contact Us</span>
              </>
            ) : (
              <span className="addon-item-price">
                ${act.price.toLocaleString("en-US")} MXN{act.unit}
              </span>
            )}
          </div>
        );
      })}
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
    const meta = PKG_META[pkgId];
    const rec = RECOMMENDED[pkgId];
    const recTip = REC_TIPS[pkgId];
    const mxn = priceMXN(pkgId);
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
          <div className="pkg-min-stay">📅 Minimum suggested stay: 5 days</div>
          {pkgId === "family" && (
            <div className="pkg-min-people">👥 Available for groups of 3 travelers and up</div>
          )}
        </div>
        <div className="pkg-body">
          <div className="pkg-includes-title">What&apos;s Included</div>
          <ul className="pkg-includes">
            {meta.includes.map((inc) => (
              <li key={inc.slice(0, 30)} className="pkg-include-item">
                <span className="pkg-check">✓</span>
                {inc}
              </li>
            ))}
          </ul>
        </div>
        {pkgId === "family" ? (
          <div className="choice-box">
            <div className="choice-label">Choose one</div>
            <div className="choice-pills">
              <button
                className={`choice-pill${familyChoice === "Xenses Park" ? " active" : ""}`}
                onClick={() => setFamilyChoice("Xenses Park")}
              >
                ✨ Xenses Park
              </button>
              <button
                className={`choice-pill${familyChoice === "Monkey Sanctuary" ? " active" : ""}`}
                onClick={() => setFamilyChoice("Monkey Sanctuary")}
              >
                🐒 Monkey Sanctuary
              </button>
            </div>
          </div>
        ) : (
          rec &&
          recTip && (
            <div className="choice-box">
              <div className="choice-label">✨ Recommended Add-On</div>
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
                    {recommendedActive[pkgId]
                      ? "✓ Added"
                      : `+$${rec.price.toLocaleString("en-US")}/person`}
                  </span>
                </button>
              </div>
            </div>
          )
        )}
        <div className="pkg-price-area">
          <div>
            <div className="pkg-price-label">From</div>
            <div className="pkg-price">
              ${Math.round(mxn).toLocaleString("en-US")} <small>MXN/person</small>
              <br />
              <span className="usd-line">≈ ${Math.round(mxn / USD_RATE).toLocaleString("en-US")} USD</span>
            </div>
          </div>
          <div className="pkg-nights">{pkgNightsText}</div>
        </div>
        <button
          className={`addons-toggle${openAddonPanels[pkgId] ? " open" : ""}`}
          onClick={() => setOpenAddonPanels((p) => ({ ...p, [pkgId]: !p[pkgId] }))}
        >
          <span className="addons-toggle-label">
            <span className="addons-toggle-line1">✨ Make It Unforgettable</span>
            <span className="addons-toggle-line2">Add Experiences</span>
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
              Buy Now
            </button>
            <button
              className="cta-btn-sm cta-contact"
              onClick={() => {
                setModalComment("");
                setModal({ kind: "quote", pkgId, pkgName: meta.name });
              }}
            >
              Contact Us
            </button>
          </div>
          <div className="private-badge">🔒 Just your group — never combined with other travelers</div>
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
        addons.push(`${rec.name} (+$${rec.price.toLocaleString("en-US")} MXN/person)`);
      const addonStr = addons.length > 0 ? addons.join(", ") : "None";
      const mxn = priceMXN(modal.pkgId);
      return (
        <>
          <div className="modal-summary-title">Booking Summary</div>
          <Row lbl="Package" val={modal.pkgName} />
          <Row lbl="Check-in" val={fmtDate(checkin)} />
          <Row lbl="Check-out" val={fmtDate(checkout)} />
          <Row lbl="Duration" val={`${nights === null ? "—" : nights} nights`} />
          <Row lbl="Adults" val={String(adults)} />
          <Row lbl="Children" val={kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"} />
          <Row lbl="Accommodation" val={accom ? `✅ ${accomText()}` : "❌ Not needed"} />
          <Row lbl="Add-ons selected" val={addonStr} />
          <div className="modal-price-row">
            <span className="lbl">Estimated base</span>
            <span className="modal-price-total">
              ${Math.round(mxn).toLocaleString("en-US")} MXN/person
            </span>
          </div>
        </>
      );
    }
    if (modal.kind === "vip") {
      return (
        <>
          <div className="modal-summary-title">Your Details</div>
          <Row lbl="Plan" val={modal.pkgName} />
          <Row lbl="Check-in" val={fmtDate(checkin)} />
          <Row lbl="Check-out" val={fmtDate(checkout)} />
          <Row lbl="Adults" val={String(adults)} />
          <Row lbl="Children" val={kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"} />
        </>
      );
    }
    const s = byoSubmitted;
    return (
      <>
        <div className="modal-summary-title">Your Trip Details</div>
        <Row lbl="Check-in" val={fmtDate(checkin)} />
        <Row lbl="Check-out" val={fmtDate(checkout)} />
        <Row lbl="Adults" val={String(adults)} />
        <Row lbl="Children" val={kids > 0 ? `${kids} (${getKidsAgesText()})` : "None"} />
        <Row lbl="Accommodation" val={accom ? `✅ ${accomText()}` : "❌ Not needed"} />
        <Row lbl="Activities of interest" val={s?.addonStr ?? "None yet"} />
        {s?.comment ? <Row lbl="Notes" val={s.comment} /> : null}
      </>
    );
  };

  return (
    <main>
      {/* SECTION HEADER */}
      <div className="section-header">
        <div className="s-label">
          <div className="s-label-line" />
          Our Packages
          <div className="s-label-line" />
        </div>
        <h1 className="s-title">
          Choose Your <em>Perfect Plan</em>
        </h1>
        <p className="s-sub">
          Select your travel dates, group size, accommodation and add-ons —<br />
          then pick the plan that fits you best.
        </p>
      </div>

      {/* INPUT BAR */}
      <div className="input-bar">
        <div className="input-group">
          <label>Check-in</label>
          <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Check-out</label>
          <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
        </div>
        {counters}
        {kidsAgesBlock}
        {accomToggleBlock}
      </div>

      {/* MIN NIGHTS HINT */}
      <div className={`dates-hint${!nightsOK ? " show" : ""}`}>
        📅 Select your check-in and check-out dates (minimum 3 nights) to unlock Buy Now on our packages.
      </div>

      {/* ACCOMMODATION OPTIONS */}
      <div className={`accom-options-bar${accom ? " show" : ""}`}>
        <span className="accom-options-label">Preferred stay:</span>
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
              <div className="pkg-name">VIP Plan</div>
              <div className="pkg-tagline">Luxury &amp; Total Freedom</div>
              <div className="pkg-min-stay">📅 Minimum suggested stay: 5 days</div>
            </div>
            <div className="pkg-body">
              <div className="pkg-includes-title">What&apos;s Included</div>
              <ul className="pkg-includes">
                {[
                  "Luxury hotels or private villas",
                  "Private transport with dedicated driver",
                  "Fully private tours & flexible itinerary",
                  "Private boat or yacht experiences",
                  "Private chef options",
                  "Access to exclusive beach locations",
                  "Concierge service 24/7",
                ].map((inc) => (
                  <li key={inc} className="pkg-include-item">
                    <span className="pkg-check">✓</span>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="pkg-customize">👉 This plan is fully customizable based on your preferences.</p>
            </div>
            <div className="pkg-price-area">
              <div>
                <div className="pkg-price-label">Starting from</div>
                <div className="pkg-price" style={{ color: "#B87A20" }}>
                  On Request
                </div>
              </div>
              <div className="pkg-nights">Tailored for you</div>
            </div>
            <div className="pkg-cta" style={{ paddingTop: 16 }}>
              <button
                className="cta-btn gold"
                onClick={() => {
                  setModalComment("");
                  setModal({ kind: "vip", pkgName: "VIP Plan" });
                }}
              >
                ✦ Get a Custom Quote
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
            Total Flexibility
          </div>
          <div className="byo-title">
            Don&apos;t see your perfect fit? <em>Build Your Own.</em>
          </div>
          <div className="byo-sub">
            Tell us your dates, group size and accommodation preference — our team will design a fully
            custom itinerary just for you.
          </div>
        </div>
        <div className="byo-right">
          <button className="byo-btn" onClick={() => setByoOpen(true)}>
            ✏️ Build Your Own Plan →
          </button>
          <div className="byo-count">Talk to a real person, no forms</div>
        </div>
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
                  ? `${modal.pkgName} — Contact Us`
                  : modal.kind === "vip"
                    ? `${modal.pkgName} — Custom Quote`
                    : "Build Your Own Plan — Quote Request"}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-summary">{modalSummaryRows()}</div>
              {modal.kind === "quote" && accom && (
                <div className="modal-note">
                  🏨 <strong>Note on accommodation:</strong> Hotel availability and pricing will be
                  confirmed within 24 hours. Your final quote will include the hotel cost once we check
                  with our partners.
                </div>
              )}
              {modal.kind === "vip" && (
                <div className="modal-note">
                  ✨ This is a <strong>fully customized</strong> experience. Our team will reach out
                  within a few hours to discuss your preferences, itinerary, and provide a tailored
                  quote just for you.
                </div>
              )}
              {modal.kind === "byo-result" && (
                <div className="modal-note">
                  ✨ This is a <strong>fully customized</strong> plan. Our team will reach out shortly
                  to confirm details, logistics, and provide your tailored quote.
                </div>
              )}
              {modal.kind !== "byo-result" && (
                <>
                  <label className="modal-comment-label">Anything else we should know?</label>
                  <textarea
                    className="modal-comment"
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder="Ask a question, tell us about a special occasion, dietary needs, etc. (optional)"
                  />
                </>
              )}
              <div className="modal-buttons">
                <a className="modal-wa-btn" href={links.wa} target="_blank" rel="noopener noreferrer">
                  {WA_ICON} Send via WhatsApp
                </a>
                <a className="modal-email-btn" href={links.email}>
                  ✉️ Send via Email
                </a>
              </div>
              <div className="modal-cancel" onClick={() => setModal(null)}>
                ← Go back
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
                <div className="byo-modal-title">Build Your Own Plan</div>
                <div className="byo-modal-sub">
                  Share your trip details and we&apos;ll design a fully custom itinerary and quote —
                  just for you.
                </div>
              </div>
              <button className="modal-close" onClick={() => setByoOpen(false)}>
                ×
              </button>
            </div>
            <div className="byo-modal-body">
              <div className="byo-controls">
                <div className="byo-controls-title">Your Trip Details</div>
                <div className="byo-ctrl-row">
                  <div className="input-group">
                    <label>Check-in</label>
                    <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Check-out</label>
                    <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
                  </div>
                </div>
                <div className="byo-ctrl-row">
                  {counters}
                  <div className="accom-toggle" style={{ flex: 1 }}>
                    <label>Accommodation</label>
                    <div className="toggle-row">
                      <button className={`toggle-btn${accom ? " active" : ""}`} onClick={() => setAccom(true)}>
                        Yes
                      </button>
                      <button className={`toggle-btn${!accom ? " active" : ""}`} onClick={() => setAccom(false)}>
                        No
                      </button>
                    </div>
                  </div>
                </div>
                {kidsAgesBlock}
                <div className={`accom-options-bar accom-options-inline${accom ? " show" : ""}`}>
                  <span className="accom-options-label">Preferred stay:</span>
                  {accomPills}
                </div>
                <button
                  className={`addons-toggle${byoAddonsOpen ? " open" : ""}`}
                  onClick={() => setByoAddonsOpen((v) => !v)}
                  style={{ margin: 0, width: "100%" }}
                >
                  <span className="addons-toggle-label">➕ Interested in any activities? Tap to browse</span>
                  <span className="addons-toggle-icon">+</span>
                </button>
                <div className={`addons-panel${byoAddonsOpen ? " open" : ""}`} style={{ padding: byoAddonsOpen ? "12px 0 0" : 0, borderTop: "none", background: "transparent" }}>
                  <div className="addon-note">
                    Select anything that catches your eye — we&apos;ll include exact pricing in your
                    custom quote.
                  </div>
                  {ACTIVITIES.map((act) => {
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
                          <span className="addon-onreq">On Request</span>
                        ) : (
                          <span className="addon-item-price">
                            ${act.price.toLocaleString("en-US")} MXN{act.unit}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <label className="modal-comment-label">What are you dreaming of?</label>
              <textarea
                className="modal-comment"
                value={byoComment}
                onChange={(e) => setByoComment(e.target.value)}
                placeholder="Tell us what you'd love to do — ruins, beaches, adventure, relaxation, a special celebration..."
              />
              <button className="byo-continue-btn" onClick={submitByo}>
                Get in Touch to Build My Plan →
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

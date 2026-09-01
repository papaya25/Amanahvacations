/* Tour catalogue data — kept in a plain module (no "use client") so both the
   client ToursClient and the server tours page can import it. The server page
   translates it for display; the `key` is the stable id used for server-side
   price verification and must never be translated. */

export type Stop = [string, string, string];
export type Tour = {
  key: string | null;
  name: string;
  sub: string;
  dur: string;
  /** Legacy per-person price (MXN) — fallback only when `groupPrices` is
      absent. When tiers exist they are the price authority. */
  price: number | null;
  /** Optional per-person sale price (MXN), legacy pricing only. */
  offer?: number;
  /** TOTAL group price (MXN) per group size — the group discount is built in
      (a bigger group pays less per person). Keys are pax counts; the smallest
      key is the minimum bookable group (e.g. Cozumel starts at 3). */
  groupPrices?: Record<number, number>;
  img: string;
  desc: string;
  stops: Stop[];
  onreq?: boolean;
};

/** Parse an admin-saved pax→total map (string keys, from JSON) into a clean
    numeric groupPrices map; null when empty/invalid. Client-safe. */
export function parseTierPrices(prices?: Record<string, number>): Record<number, number> | null {
  if (!prices) return null;
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(prices)) {
    const pax = Number(k);
    const total = Number(v);
    if (Number.isFinite(pax) && pax > 0 && Number.isFinite(total) && total > 0) out[pax] = total;
  }
  return Object.keys(out).length ? out : null;
}

/** Selectable group sizes for a tour, smallest first. */
export function tourPaxOptions(t: Pick<Tour, "groupPrices">): number[] {
  return t.groupPrices
    ? Object.keys(t.groupPrices).map(Number).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b)
    : [];
}

/** Total group price (MXN) for `pax` people, clamping to the nearest offered
    tier (below-minimum pays the minimum-group price). Null when unpriced. */
export function tourTotalFor(t: Pick<Tour, "groupPrices" | "price">, pax: number): number | null {
  const opts = tourPaxOptions(t);
  if (opts.length) {
    const clamped = Math.min(Math.max(pax, opts[0]), opts[opts.length - 1]);
    // Exact tier when offered; otherwise the nearest tier below.
    const tier = opts.filter((n) => n <= clamped).pop() ?? opts[0];
    return t.groupPrices![tier] ?? null;
  }
  return t.price != null && t.price > 0 ? t.price * Math.max(1, pax) : null;
}

export const TOURS: Tour[] = [
  {
    key: "akumalcenotes", name: "Akumal Sea Turtles, Snorkeling & Cenotes", sub: "Dos Ojos Cenote + Akumal Snorkeling",
    dur: "6 hours", price: 3000,
    groupPrices: { 2: 6000, 3: 7850, 4: 9850, 5: 11650, 6: 13300 },
    img: "/images/tours/akumalcenotes.jpg",
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
    key: "tulumcenotes", name: "Tulum Ruins & Cenotes", sub: "Dos Ojos Cenote + Tulum Archaeological Site",
    dur: "6–8 hours", price: 2650,
    groupPrices: { 2: 5300, 3: 6850, 4: 8000, 5: 9650, 6: 11150 },
    img: "/images/tours/tulumcenotes.jpg",
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
    dur: "Full day", price: 2850,
    groupPrices: { 2: 5700, 3: 7300, 4: 8700, 5: 10300, 6: 12000 },
    img: "/images/tours/cobacenotes.jpg",
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
    dur: "Approx. 4 hours", price: 6650,
    groupPrices: { 2: 13300, 3: 13950, 4: 14850, 5: 16800, 6: 18700 },
    img: "/images/tours/cozumel.jpg",
    desc: "A private boat to four of Cozumel's best reefs, with fresh ceviche and drinks on board — plus top-quality photos and videos of your day, shot with a GoPro and the latest-generation iPhone, all included.",
    stops: [
      ["Morning · Private Pickup", "Playa del Carmen to Cozumel", "Pickup and ferry crossing to the island."],
      ["Snorkel Stop", "El Cielo & El Cielito Reefs", "Crystal-clear shallow reefs famous for starfish."],
      ["Snorkel Stop", "Colombia & Lever Reefs", "Vibrant coral gardens teeming with life."],
      ["Onboard", "Snacks, Drinks & Photos", "Fresh ceviche, snacks and drinks on your private boat — while your crew captures top-quality photos and videos with a GoPro and the latest iPhone, included."],
      ["Afterwards", "Downtown Cozumel", "A short guided tour of the island's charming downtown before the ferry back."],
      ["Return", "Back to Playa del Carmen", ""],
    ],
  },
  {
    key: "akumaltulum", name: "Tulum & Akumal", sub: "Dos Ojos + Tulum Ruins + Akumal Snorkeling",
    dur: "Full day", price: 3775,
    groupPrices: { 2: 7550, 3: 10050, 4: 12300, 5: 14650, 6: 17150 },
    img: "/images/tours/akumaltulum.jpg",
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
    dur: "Full day", price: 4575,
    groupPrices: { 2: 9150, 3: 11550, 4: 14000, 5: 16800, 6: 18850 },
    img: "/images/tours/chichen.jpg",
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
    dur: "Half day", price: 3350,
    groupPrices: { 2: 6700, 3: 8550, 4: 9700, 5: 11550, 6: 12700 },
    img: "/images/tours/rutacenotes.jpg",
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
    key: "holbox", name: "Holbox Island", sub: "Private Boat · Isla Pasión + Punta Mosquito + Holbox Town",
    dur: "Full day (~12 hours)", price: 5725,
    groupPrices: { 2: 11450, 3: 15000, 4: 17150, 5: 19300, 6: 21450 },
    img: "/images/tours/holbox.jpg",
    desc: "A car-free island of flamingos, bioluminescent water, and untouched beaches — explored by private boat, with unlimited water and soft drinks on board.",
    stops: [
      ["Morning · Private Pickup", "Your Hotel or Airbnb → Chiquilá", "We pick you up directly and drive you to the port of Chiquilá, where your private boat is waiting."],
      ["First Stop", "Isla Pasión", "A stunning island famous for its migratory birds — we arrive among the first visitors of the day to enjoy its peaceful beauty."],
      ["Swim & Relax", "Punta Mosquito", "One of the most beautiful beaches in the world — crystal-clear water, white sand and complete relaxation."],
      ["Golden Hour", "Holbox Rooftop", "The most beautiful rooftop on the island, with spectacular panoramic views — the perfect place for a refreshing drink."],
      ["Lunch", "Beachfront Restaurant", "A delicious meal with your feet in the sand and an incredible ocean view."],
      ["Explore", "Downtown Holbox by Buggy Taxi", "The island's history, colorful street art and charming church — finishing with a special local surprise."],
      ["Return", "Chiquilá → Your Hotel", "Back by boat to Chiquilá, then comfortable private transport to your hotel or Airbnb."],
    ],
  },
  {
    key: null, name: "Isla Contoy National Park", sub: "Ixlaché Reef + Isla Contoy + Isla Mujeres",
    dur: "Full day", price: null, onreq: true, img: "/images/tours/contoy.jpg",
    desc: "A protected bird sanctuary limited to 200 visitors a day — the wildest corner of the Mexican Caribbean. Arranged personally with you.",
    stops: [],
  },
];

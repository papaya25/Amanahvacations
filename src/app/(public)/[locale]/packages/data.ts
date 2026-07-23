/* Package-configurator catalogue data — kept in a plain module (no "use client")
   so the server page can translate the visitor-facing fields (add-on names &
   descriptions, accommodation tier labels, recommended add-ons) and pass them to
   the client component. Ids and prices are stable and never translated. */

export const PACKAGE_IDS = ["basic", "family", "water", "explorer", "honeymoon"] as const;
export type PkgId = (typeof PACKAGE_IDS)[number];

export type Activity = {
  id: string;
  name: string;
  emoji: string;
  price: number | null;
  unit: string;
  inCart: boolean;
  desc: string;
};

export const ACCOM_TIERS = [
  { id: "4-star", emoji: "🏨", label: "4-Star Hotel" },
  { id: "5-star", emoji: "✨", label: "5-Star Hotel" },
  { id: "all-inclusive", emoji: "🍽️", label: "All-Inclusive" },
  { id: "airbnb", emoji: "🏡", label: "Airbnb / Villa" },
];

export const ACTIVITIES: Activity[] = [
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

export const RECOMMENDED: Partial<Record<PkgId, { id: string; name: string; price: number }>> = {
  basic: { id: "xcaret", name: "Xcaret Park", price: 3500 },
  water: { id: "xelha", name: "Xel-Há Park", price: 2850 },
  explorer: { id: "xplorfuego", name: "Xplor Fuego", price: 2850 },
  honeymoon: { id: "holbox", name: "Holbox Overnight", price: 7800 },
};

export const REC_TIPS: Partial<Record<PkgId, { label: string; tip: string }>> = {
  basic: { label: "🌺 Xcaret Park", tip: "Round out your trip with a full day at Xcaret — an eco-archaeological park blending underground rivers, wildlife encounters and Maya history." },
  water: { label: "🎢 Xel-Há Park", tip: "An all-inclusive natural aquatic park — snorkel a lagoon fed by underground rivers, cliff-jump, and relax on the beach, all included." },
  explorer: { label: "🔥 Xplor Fuego Park", tip: "The nighttime edition of Xplor — the same jungle adventure circuits illuminated after dark for a completely different thrill. Open 5:30 PM – 11:00 PM." },
  honeymoon: { label: "🦩 Holbox Romantic Night", tip: "A night away on magical Holbox Island — hotel stay and a romantic dinner on the beach included." },
};

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
  { id: "quinta", name: "Quinta Av Guided Tour", emoji: "🛍️", price: 500, unit: "/person", inCart: true, desc: "A private guided walk down the charming Quinta Avenida in Playa del Carmen, with stops at recommended shops and restaurants." },
  { id: "cozumel", name: "Cozumel Private Tour", emoji: "⛵", price: 4600, unit: "/person", inCart: true, desc: "A private tour of Cozumel by private boat — reefs, beaches and the island at your own pace." },
  { id: "rutacenotes", name: "Ruta de los Cenotes Tour", emoji: "💧", price: 2900, unit: "/person", inCart: true, desc: "A full cenote route — four different cenotes (two open-air, two underground) with a diving platform and water zip line. Includes hammock area, life jackets, lockers, parking and showers." },
  { id: "cenotevisit", name: "Cenote Visit", emoji: "💦", price: 1000, unit: "/person", inCart: true, desc: "A visit to one beautiful cenote — perfect for a refreshing swim in crystal-clear water." },
  { id: "aquariumcontoy", name: "Isla Contoy", emoji: "🦅", price: null, unit: "", inCart: false, desc: "A private excursion to the protected paradise of Isla Contoy — arranged personally with you, priced per group." },
  { id: "whalesharks", name: "Whale Sharks Tour", emoji: "🐋", price: null, unit: "", inCart: false, desc: "A seasonal encounter swimming alongside the world's largest fish. Availability depends on the season — our team will confirm dates for you." },
  { id: "yacht", name: "Private Yacht", emoji: "⛵", price: null, unit: "", inCart: false, desc: "A private yacht charter tailored to your group — pricing depends on the number of hours and type of tour you'd like." },
  { id: "siankaan", name: "Sian Ka'an", emoji: "🌿", price: null, unit: "", inCart: false, desc: "A boat journey through the ancient Maya canals of the Sian Ka'an Biosphere Reserve — availability depends on the day, our team will confirm." },
  { id: "jungle-adventure", name: "Jungle Adventure", emoji: "🛺", price: null, unit: "", inCart: false, desc: "7–8 hours of adrenaline in the Mayan jungle — an ATV ride along jungle trails, a zipline course above the canopy, suspension bridges, swimming in two crystal-clear cenotes, a Mayan pyramid and museum. Lunch and private transportation included." },
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
  family: { id: "xcaret", name: "Xcaret Park", price: 3500 },
  water: { id: "xelha", name: "Xel-Há Park", price: 2850 },
  explorer: { id: "xplorfuego", name: "Xplor Fuego", price: 2850 },
  honeymoon: { id: "cozumel", name: "Cozumel Private Boat", price: 4600 },
};

export const REC_TIPS: Partial<Record<PkgId, { label: string; tip: string }>> = {
  basic: { label: "🌺 Xcaret Park", tip: "Round out your trip with a full day at Xcaret — an eco-archaeological park blending underground rivers, wildlife encounters and Maya history." },
  family: { label: "🌺 Xcaret Plus", tip: "The landmark park of the Riviera Maya — underground rivers, wildlife and Maya heritage, ending with the Xcaret México Espectacular evening show. Plus admission adds buffet dining, changing rooms, lockers and towels." },
  water: { label: "🎢 Xel-Há Park", tip: "An all-inclusive natural aquatic park — snorkel a lagoon fed by underground rivers, cliff-jump, and relax on the beach, all included." },
  explorer: { label: "🔥 Xplor Fuego Park", tip: "The nighttime edition of Xplor — the same jungle adventure circuits illuminated after dark for a completely different thrill. Open 5:30 PM – 11:00 PM." },
  honeymoon: { label: "⛵ Cozumel — El Cielo", tip: "A private boat to El Cielo and El Cielito — starfish resting on white sand under water so clear the boat seems to float on air. Ferry, captain and crew, snorkel gear, fresh fruit and ceviche included." },
};

/* ── "See full details" popup content ─────────────────────────────────────────
   Day-by-day descriptions per package, from Maher's package documents. The
   server page translates every text field and passes the result to the client;
   ids/structure never change. VIP has no entry (custom-quoted, no fixed days). */

export type PkgDay = {
  title: string;
  dur: string;
  desc: string;
  /** "·"-separated list of what the day includes. */
  included: string;
};

export type PkgDetails = {
  intro: string;
  days: PkgDay[];
  /** Optional-add-on note shown at the end of the popup. */
  addonNote?: string;
  /** Suggested week, one line per day. */
  week: string[];
  weekNote: string;
};

export const PKG_DETAILS: Partial<Record<PkgId, PkgDetails>> = {
  basic: {
    intro:
      "The Riviera Maya's must-do experiences, without the guesswork. One full day that takes in a clifftop Mayan city, a cave cenote and a bay full of sea turtles — then a morning snorkelling off Playa del Carmen and an afternoon walking the town with someone who lives here. Everything is 100% private: your own vehicle, your own guide, your own pace.",
    days: [
      {
        title: "Tulum Ruins, Cenote Dos Ojos & Akumal",
        dur: "Approximately 8 hours · 100% private",
        desc: "Three of the region's signature experiences in one day. Tulum is the only Mayan city built on the sea — a walled citadel on a limestone cliff above the Caribbean, still standing after eight centuries; your certified private guide walks you through what the buildings were for and who lived in them. Cenote Dos Ojos — \"two eyes\" — is part of one of the longest underwater cave systems ever mapped: still, glass-clear freshwater under a ceiling dense with stalactites, with visibility running to a hundred metres. Akumal means \"place of the turtles\" in Maya, and green sea turtles graze its shallow, protected bay year-round, close enough to swim alongside — wild animals in their own habitat, observed with guides trained in respectful distance.",
        included: "100% private round-trip transportation · Certified private guide · All entrance fees · Snorkelling equipment · Beverages",
      },
      {
        title: "Snorkelling in Playa del Carmen",
        dur: "Approximately 3 hours",
        desc: "The Mesoamerican Barrier Reef — the second largest reef system on earth — runs the length of this coast, and a section of it sits a short way offshore from Playa del Carmen itself. A relaxed morning in the water among angelfish, parrotfish, sergeant majors and rays, with no long drive and no early start. Suitable for beginners.",
        included: "Guide · Snorkelling equipment · Life jackets",
      },
      {
        title: "Playa del Carmen — Quinta Avenida",
        dur: "Approximately 3 hours",
        desc: "Quinta Avenida runs twenty blocks parallel to the beach — boutiques, artisan workshops, street performers and open-air cafés. Your guide walks it with you as someone who lives here rather than as a route on a map, and shows you the quieter corners of town that are not on it.",
        included: "Private guide",
      },
      {
        title: "Private Airport Transfers",
        dur: "Arrival and departure",
        desc: "A member of our team meets you inside Cancún International Airport and takes you directly to your accommodation in a private, air-conditioned vehicle. No shuttle stops, no waiting for other passengers, no negotiating with drivers after a long flight. On departure, the same service in reverse, timed to your flight.",
        included: "Private air-conditioned vehicle · Meet & greet inside the airport",
      },
    ],
    addonNote:
      "Optional add-ons — Jungle Adventure (ATVs, ziplines, suspension bridges and two cenotes) and Xcaret Plus (the landmark park with its evening show). Available at booking or during your stay.",
    week: [
      "Arrival · private airport transfer · welcome",
      "Playa del Carmen — Quinta Avenida (half day)",
      "Tulum Ruins, Cenote Dos Ojos & Akumal",
      "Yours",
      "Snorkelling in Playa del Carmen (half day)",
      "Departure · private airport transfer",
    ],
    weekNote:
      "This sequence is a recommendation — your concierge adjusts it to your flights, your preferences and your pace.",
  },
  family: {
    intro:
      "A week in the Riviera Maya designed around children — short drives, gentle water, and days that end before anyone is too tired to enjoy them. You swim with wild sea turtles in a shallow protected bay, meet spider monkeys and coatis at a rescue sanctuary, float in two open-air cenotes, and spend a day in a park that turns everything upside down. Every tour is 100% private, at a pace set by your family rather than by a schedule.",
    days: [
      {
        title: "Akumal & the Monkey Sanctuary",
        dur: "Full day · 100% private",
        desc: "Akumal means \"place of the turtles\" in Maya, and it has earned the name for a thousand years. Green sea turtles graze the seagrass beds in a shallow, protected bay — close enough to swim alongside, in water calm and clear enough for a confident child. Life jackets are provided for everyone. In the afternoon, a short drive inland to a rescue sanctuary caring for spider monkeys, coatis, macaws and other animals recovered from the illegal wildlife trade — children walk the shaded jungle paths with a keeper and, under supervision, get close to some of them. For most families this is the day the children talk about afterwards.",
        included: "100% private round-trip transportation · Guide · All entrance fees · Snorkelling equipment and life jackets · Sanctuary admission · Beverages",
      },
      {
        title: "Cenote Cristalino & Cenote Azul",
        dur: "Approximately 5 hours · 100% private",
        desc: "Two open-air cenotes twenty minutes south of Playa del Carmen — the right pair for children. Cenote Cristalino is exactly what its name promises: clear, bright water in a wide pool ringed by jungle, with a shallow shelf for small children and a small cave for the braver ones. Cenote Azul is a series of connected pools stepping down through the rock, with terraces shallow enough to stand in and deeper sections for stronger swimmers. Tiny fish nibble at your feet if you stay still.",
        included: "100% private round-trip transportation · Guide · Both entrance fees · Life jackets",
      },
      {
        title: "Xenses Park",
        dur: "Approximately 5 hours",
        desc: "A park of illusions, built for exactly this age range: a town where water appears to run uphill, a path walked barefoot and blindfolded through changing textures, an underground river floated in darkness, and a warm mud bath followed by a wash in a natural spring. Nothing requires swimming ability or nerve — it rewards curiosity instead. Children come out of it filthy, delighted and full of stories.",
        included: "Full park admission · Round-trip transportation",
      },
      {
        title: "Playa del Carmen — Quinta Avenida",
        dur: "Approximately 3 hours",
        desc: "Quinta Avenida runs twenty blocks parallel to the beach — boutiques, artisan workshops, street performers, ice cream and open-air cafés. Your guide walks it with you as someone who lives here, and shows you the quieter parts of town. An easy afternoon, and a good one for the first or last day.",
        included: "Private guide",
      },
      {
        title: "Private Airport Transfers",
        dur: "Arrival and departure",
        desc: "A member of our team meets you inside Cancún International Airport and takes you directly to your accommodation in a private, air-conditioned vehicle — no shuttle stops, no waiting with tired children, no negotiating with drivers after a long flight. On departure, the same service in reverse.",
        included: "Private air-conditioned vehicle · Meet & greet inside the airport",
      },
    ],
    addonNote:
      "Optional add-on — Xcaret Plus: the landmark park of the Riviera Maya, ending with the Xcaret México Espectacular evening show (300 performers tracing Mexico's history). Plus admission adds buffet dining, changing rooms, lockers and towels. Available at booking or during your stay.",
    week: [
      "Arrival · private airport transfer · welcome",
      "Playa del Carmen — Quinta Avenida (half day)",
      "Akumal & the Monkey Sanctuary",
      "Yours",
      "Cenote Cristalino & Cenote Azul (half day)",
      "Yours",
      "Xenses Park",
      "Departure · private airport transfer",
    ],
    weekNote:
      "This sequence is a recommendation — the only full day sits mid-week, with rest days on either side. Your concierge adjusts it to your flights and your pace.",
  },
  water: {
    intro:
      "Seven nights built around water. You swim with green sea turtles in a protected bay, snorkel one of the largest barrier reefs on earth from your own private boat, and descend into four cenotes — freshwater caves the Maya believed were doorways to the underworld. Every day is 100% private: your own vehicle, your own boat, your own guide, your own pace.",
    days: [
      {
        title: "Akumal & Cenote Dos Ojos",
        dur: "Approximately 7 hours · 100% private",
        desc: "A shallow, protected bay where green sea turtles graze the seagrass beds year-round, close enough to swim alongside — wild animals in their own habitat, observed with guides trained in respectful distance. Then Cenote Dos Ojos — \"two eyes\" — among the most beautiful cave systems in the world: two connected sinkholes of still, glass-clear freshwater beneath a limestone ceiling dense with stalactites, lit by shafts of sunlight. The water has never touched the sea, and visibility runs to a hundred metres.",
        included: "100% private round-trip transportation · Guide · All entrance fees · Snorkelling equipment · Beverages",
      },
      {
        title: "Cozumel — El Cielo & El Cielito",
        dur: "Full day · Private boat",
        desc: "The reefs on Cozumel's sheltered western side are among the most celebrated snorkel sites in the world — Jacques Cousteau put them on the map in 1961. You cross by ferry, then board your own private boat with captain and crew. El Cielo — \"the sky\" — is a shallow sandbar where dozens of starfish rest on white sand beneath water so clear the boat appears to float on air; El Cielito is its quieter neighbour. Between them you snorkel Palancar and Colombia reefs, where coral walls drop into deep blue and turtles, eagle rays and shoals of tropical fish pass through.",
        included: "Round-trip ferry · Round-trip transportation · Private boat with captain & crew · Guide · Snorkelling equipment · Fresh fruit and ceviche · Soft drinks and water",
      },
      {
        title: "Ruta de los Cenotes",
        dur: "Approximately 6 hours · 100% private",
        desc: "The Ruta de los Cenotes runs inland from Puerto Morelos through dense jungle, past some of the finest cenotes on the peninsula — far from the coast and far from the crowds. You visit four in a single day: two underground caves — cathedral spaces of still turquoise water under ceilings hung with stalactites — and two open-air pools ringed by jungle, with platforms for those who want to jump. The gentlest day in the package.",
        included: "100% private round-trip transportation · Guide · All entrance fees · Four cenotes",
      },
      {
        title: "Private Airport Transfers",
        dur: "Arrival and departure",
        desc: "A member of our team meets you inside Cancún International Airport and takes you directly to your accommodation in a private, air-conditioned vehicle. On departure, the same service in reverse, timed to your flight.",
        included: "Private air-conditioned vehicle · Meet & greet inside the airport",
      },
    ],
    addonNote:
      "Optional add-on — Sian Ka'an Biosphere Reserve: a UNESCO World Heritage Site of wetland, mangrove, jungle and reef, where you float an ancient hand-cut Maya canal on the current itself. Dolphins, manatees, sea turtles and more than three hundred species of bird. Available at booking or during your stay.",
    week: [
      "Arrival · private airport transfer · welcome",
      "Akumal & Cenote Dos Ojos",
      "Yours",
      "Cozumel — El Cielo & El Cielito",
      "Yours",
      "Ruta de los Cenotes",
      "Yours (Sian Ka'an add-on available)",
      "Departure · private airport transfer",
    ],
    weekNote:
      "This sequence is a recommendation — the two full days, Cozumel and Akumal, are deliberately separated. Your concierge adjusts it to your flights and your pace.",
  },
  explorer: {
    intro:
      "Seven nights across the Yucatán Peninsula for travellers who came to see something, not just to sit somewhere. You walk the ball court at Chichén Itzá, climb into the jungle at Cobá, stand on the cliff at Tulum where the Maya watched the sunrise, and swim in four cenotes that have been sacred for a thousand years. Every day is 100% private — no shared vans, no waiting for strangers, no rushing to a schedule set by someone else.",
    days: [
      {
        title: "Chichén Itzá, Valladolid & Two Cenotes",
        dur: "Approximately 10 hours · 100% private",
        desc: "Chichén Itzá is the most complete Mayan city still standing, and one of the New Seven Wonders of the World. Your private guide takes you through the Great Ball Court — the largest in Mesoamerica, where the acoustics carry a whisper the length of a football field — the Temple of the Warriors, and El Castillo, the pyramid built so precisely that twice a year the setting sun casts a serpent of shadow down its staircase. Lunch in Valladolid, a colonial Pueblo Mágico of pastel facades. Then Cenote Suytun — the circular cavern where a single shaft of light lands on the stone platform at midday — and Cenote Samulá, quieter and greener, its ceiling pierced by tree roots reaching all the way to the water.",
        included: "100% private round-trip transportation · Certified private guide · All entrance fees · Two cenotes · Lunch in Valladolid",
      },
      {
        title: "Cobá, Cenote Choo-Ha & Cenote Tankach-Ha",
        dur: "Approximately 7 hours · 100% private",
        desc: "Cobá is the jungle city — still half-swallowed by forest, pyramids rising out of the trees, ancient raised roads running dead straight for kilometres into the undergrowth. You move through the site by bicycle or tricycle taxi along shaded jungle paths, past Nohoch Mul, one of the tallest pyramids on the peninsula at 42 metres. Afterwards, two of the region's most beautiful cave cenotes: Choo-Ha, shallow and wide beneath a ceiling dense with stalactites, and Tankach-Ha, deeper, with platforms for those who want to jump.",
        included: "100% private round-trip transportation · Certified private guide · All entrance fees · Two cenotes",
      },
      {
        title: "Tulum Ruins & Akumal",
        dur: "Approximately 8 hours · 100% private",
        desc: "Tulum is the only Mayan city built on the coast, and the last one they built — a walled citadel on a limestone cliff above the Caribbean, a working port when the Spanish arrived. The Temple of the Frescoes still carries traces of its original paint, and El Castillo stands directly above a small beach where you can swim beneath the ruins. Then Akumal — \"place of the turtles\" — where green sea turtles graze a shallow, protected bay close enough to swim alongside.",
        included: "100% private round-trip transportation · Certified private guide · All entrance fees · Snorkelling equipment · Beverages",
      },
      {
        title: "Playa del Carmen — Quinta Avenida",
        dur: "Approximately 3–4 hours",
        desc: "Quinta Avenida runs twenty blocks parallel to the beach — boutiques, artisan workshops, street performers and open-air cafés. Your guide walks it with you as someone who lives here rather than as a route on a map.",
        included: "Private guide",
      },
      {
        title: "Private Airport Transfers",
        dur: "Arrival and departure",
        desc: "A member of our team meets you inside Cancún International Airport and takes you directly to your accommodation in a private, air-conditioned vehicle. On departure, the same service in reverse, timed to your flight.",
        included: "Private air-conditioned vehicle · Meet & greet inside the airport",
      },
    ],
    week: [
      "Arrival · private airport transfer · welcome",
      "Playa del Carmen tour — Quinta Avenida & the town",
      "Tulum Ruins & Akumal",
      "Yours",
      "Chichén Itzá, Valladolid, Cenote Suytun & Cenote Samulá",
      "Yours",
      "Cobá, Cenote Choo-Ha & Cenote Tankach-Ha",
      "Departure · private airport transfer",
    ],
    weekNote:
      "This sequence is a recommendation — the two longest days, Chichén Itzá and Cobá, are deliberately separated. Your concierge adjusts it to your flights and your pace.",
  },
  honeymoon: {
    intro:
      "Seven nights in the Riviera Maya, designed entirely for two. Five curated days, every one of them private — no shared vans, no group tours, no strangers on your honeymoon. Between them, unhurried days that are yours alone. Every meal and supplier is certified halal, prayer times are noted in your itinerary, and no alcohol is served at any meal or transport we arrange.",
    days: [
      {
        title: "Holbox Island",
        dur: "Approximately 12 hours · Private boat",
        desc: "Holbox is what the Riviera Maya looked like before the Riviera Maya — a narrow island of sand streets and no cars, where the Caribbean meets the Gulf of Mexico in water so shallow and clear you can walk out for hundreds of metres. You travel by private transport to the ferry, then board your own boat — not a shared tour — and the day moves at your pace through the island's lagoons and sandbars, with time in the water and time simply drifting.",
        included: "Private round-trip transportation · Private boat · Guide · Soft drinks & water · Guacamole, exotic fruits & shrimp ceviche · Rooftop bar with panoramic views · Traditional Holbox ice cream · Visit to Holbox town",
      },
      {
        title: "Tulum Ruins, Cenote Dos Ojos & Akumal",
        dur: "Approximately 8 hours · 100% private",
        desc: "Three of the Yucatán's signature experiences in a single day, and the one your photographs will come from. Tulum — the only Mayan city built on the coast, a walled clifftop citadel above turquoise water. Cenote Dos Ojos — two connected sinkholes of still, glass-clear freshwater lit by shafts of sunlight through the limestone. And Akumal, where green sea turtles graze a shallow protected bay close enough to swim alongside.",
        included: "100% private round-trip transportation · Certified private guide · All entrance fees · Beverages throughout the day · Snorkel equipment",
      },
      {
        title: "Xcaret Plus — Park & Evening Show",
        dur: "Full day into the evening",
        desc: "The Riviera Maya's cultural landmark: 200 acres of underground rivers, jungle paths, wildlife sanctuaries and Mayan heritage. The day ends with Xcaret México Espectacular — a 90-minute performance tracing Mexico's history with 300 performers, live music and regional dance, widely considered the finest cultural show in the country. Plus admission includes buffet dining, private changing rooms, lockers and towels. All food we arrange for you is halal-certified.",
        included: "Full Plus admission · Buffet dining · Evening show · Round-trip transportation",
      },
      {
        title: "Jungle Adventure",
        dur: "7–8 hours · 100% private",
        desc: "The day for adrenaline. You ride ATVs along jungle trails, cross suspension bridges through the canopy, and fly a zipline circuit above the trees. Between the adventure sections you swim in two cenotes, and visit a Mayan pyramid and its small museum.",
        included: "ATV ride · Zipline course · Suspension bridges · Two cenotes · Mayan pyramid & museum · Lunch · 100% private transportation · Guide",
      },
      {
        title: "Playa del Carmen Evening — Quinta Avenida & Romantic Dinner",
        dur: "Late afternoon into the evening",
        desc: "Quinta Avenida is Playa del Carmen's pedestrian heart — twenty blocks of boutiques, artisan shops, street performers and open-air cafés. The evening ends with a private romantic dinner at Mahekal Beach Resort — a table set on the sand, the Caribbean a few metres away, candlelight and the sound of the water. Every dish is halal-certified.",
        included: "Private guided stroll · Romantic beachfront dinner, halal-certified",
      },
      {
        title: "Private Airport Transfers",
        dur: "Arrival and departure",
        desc: "Your honeymoon begins the moment you land: a member of our team meets you inside Cancún International Airport and takes you directly to your accommodation in a private, air-conditioned vehicle. On departure day, the same service in reverse, timed to your flight with enough margin that you never feel rushed.",
        included: "Private air-conditioned vehicle · Meet & greet inside the airport",
      },
    ],
    addonNote:
      "Optional add-on — Cozumel, El Cielo & El Cielito: a private boat to the shallow sandbar where starfish rest on white sand under impossibly clear water, snorkelling Colombia and Palancar reefs on the way. Available at booking or during your stay.",
    week: [
      "Arrival · private transfer · welcome",
      "Quinta Avenida stroll & romantic dinner",
      "Tulum Ruins, Cenote Dos Ojos & Akumal",
      "Yours",
      "Holbox Island",
      "Yours (Cozumel add-on available)",
      "Xcaret Plus & evening show",
      "Departure · private transfer",
    ],
    weekNote:
      "This sequence is a recommendation — your concierge adjusts it to your flights, your preferences and your pace.",
  },
};

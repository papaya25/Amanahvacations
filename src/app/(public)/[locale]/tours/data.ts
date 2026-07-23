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
  price: number | null;
  /** Optional per-person sale price (MXN). If set below `price`, the card shows
      the original struck through and this offer price highlighted. */
  offer?: number;
  img: string;
  desc: string;
  stops: Stop[];
  onreq?: boolean;
};

export const TOURS: Tour[] = [
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
    dur: "Full day", price: 6600, offer: 5500, img: "/images/tours/chichen.jpg",
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

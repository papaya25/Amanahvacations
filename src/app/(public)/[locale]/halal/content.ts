/* All visitor-facing text for the Halal page. Plain module (no "use client")
   so the server page can translate it and pass it to the client component.
   Icons stay in HalalClient, matched by index. */

export type HalalTextItem = { title: string; desc: string };
export type HalalDining = { tag: string; name1: string; nameEm: string; desc: string; features: string[] };
export type HalalTrust = { n: string; l1: string; l2: string };

export type HalalContent = {
  heroBadge: string;
  heroTitle1: string;
  heroTitleEm: string;
  heroSub: string;
  introEyebrow: string;
  introTitle1: string;
  introTitleEm: string;
  introTitle2: string;
  introText: string;
  promiseStrip: string[];
  faithTagline: string;
  pillarsEyebrow: string;
  pillarsTitle1: string;
  pillarsTitleEm: string;
  pillarsNote: string;
  diningEyebrow: string;
  diningTitle1: string;
  diningTitleEm: string;
  diningNote: string;
  villaEyebrow: string;
  villaTitle1: string;
  villaTitleEm: string;
  villaContentEyebrow: string;
  villaContentTitle1: string;
  villaContentTitleEm: string;
  villaCorner: string;
  villaText: string;
  activitiesEyebrow: string;
  activitiesTitle1: string;
  activitiesTitleEm: string;
  activitiesNote: string;
  promiseLabel: string;
  promiseQuote: string;
  bodyParas: string[];
  ctaEyebrow: string;
  ctaHeadline1: string;
  ctaHeadlineEm: string;
  ctaPrimary: string;
  ctaSecondary: string;
  modalEyebrow: string;
  modalTitle: string;
  modalText: string;
  modalWhatsApp: string;
  modalEmail: string;
  mantra1: string;
  mantra2: string;
  mantra3: string;
  pillars: HalalTextItem[];
  perks: HalalTextItem[];
  activities: HalalTextItem[];
  dining: HalalDining[];
  trust: HalalTrust[];
  promiseList: string[];
};

export const HALAL_CONTENT_EN: HalalContent = {
  heroBadge: "Muslim-Friendly Travel",
  heroTitle1: "Travel With",
  heroTitleEm: "Peace of Mind",
  heroSub: "Halal · Riviera Maya · Tailored for You",
  introEyebrow: "A Journey Rooted in Trust",
  introTitle1: "Luxury travel that",
  introTitleEm: "honors your faith",
  introTitle2: "and your family.",
  introText:
    "At Amanah Vacations, we understand that for Muslim travelers, a perfect trip is about more than beautiful destinations — it's about feeling at ease, respected, and at home wherever you are. We handle every detail so you can focus on what truly matters: creating meaningful memories with the people you love, without compromise.",
  promiseStrip: [
    "Halal-certified dining & private chef options",
    "Private villas — fully alcohol-free environments",
    "Prayer space, Qibla direction & Friday Jumu'ah guidance",
    "Family-first experiences, modest beach & pool setups",
    "A concierge who understands your needs",
  ],
  faithTagline: "Trust in Adventure.",
  pillarsEyebrow: "Our Commitment",
  pillarsTitle1: "What We",
  pillarsTitleEm: "Ensure for You",
  pillarsNote: "Every element of your trip is thoughtfully arranged with halal principles and your family's comfort in mind.",
  diningEyebrow: "Halal Dining",
  diningTitle1: "Eat Well,",
  diningTitleEm: "Eat Halal",
  diningNote: "Great food is central to any great trip. We make sure every meal meets your standards — without sacrificing flavor or experience.",
  villaEyebrow: "Where You'll Stay",
  villaTitle1: "Private Villas —",
  villaTitleEm: "Your Space, Your Rules",
  villaContentEyebrow: "Muslim-Friendly Accommodations",
  villaContentTitle1: "Luxury villas chosen for",
  villaContentTitleEm: "comfort and privacy.",
  villaCorner: "Alcohol-Free",
  villaText:
    "Rather than recommending hotels where alcohol is present and shared spaces are unavoidable, we exclusively place our halal clients in private luxury villas. These are fully self-contained retreats where you control the environment — no alcohol on the premises, no unwanted intrusions, and complete freedom to live as you wish.",
  activitiesEyebrow: "Family Experiences",
  activitiesTitle1: "Activities for",
  activitiesTitleEm: "Every Member",
  activitiesNote: "From young children to grandparents, we curate experiences that bring families together — always respectful, always memorable.",
  promiseLabel: "Our Promise",
  promiseQuote: "Travel that honors your faith, your family, and your freedom.",
  bodyParas: [
    "We believe that Muslim families deserve to travel with the same freedom, luxury, and joy as anyone else — without having to compromise their values at every turn. That's why Amanah Vacations was built with trust at its core.",
    "From the moment you reach out to us, our team gets to know your family's needs, preferences, and expectations. We handle everything — the villa, the meals, the prayer arrangements, the activities — so that by the time you arrive, the only thing left to do is enjoy.",
    "The Riviera Maya is one of the most beautiful destinations in the world, and we want every Muslim traveler to experience it fully, comfortably, and with complete peace of mind. Whether it's your first time visiting Mexico or your fifth, we'll make it the trip you remember forever.",
  ],
  ctaEyebrow: "Plan Your Halal Journey",
  ctaHeadline1: "Ready to travel",
  ctaHeadlineEm: "without compromise?",
  ctaPrimary: "Request VIP Experience",
  ctaSecondary: "Explore All Activities",
  modalEyebrow: "Plan Your Halal Journey",
  modalTitle: "Request Your VIP Experience",
  modalText:
    "Tell us a little about your trip — dates, group size, and what matters most to your family — and our team will reach out to design a fully halal, VIP-tailored journey just for you.",
  modalWhatsApp: "Send via WhatsApp",
  modalEmail: "Send via Email",
  mantra1: "Your faith.",
  mantra2: "Your family.",
  mantra3: "Your adventure.",
  pillars: [
    { title: "Halal Food & Dining", desc: "Access to halal-certified restaurants and private chef services using only halal-sourced ingredients." },
    { title: "Prayer & Qibla", desc: "Prayer time schedules, Qibla direction, dedicated prayer space in your villa, and nearest mosque guidance." },
    { title: "Alcohol-Free Villas", desc: "Private luxury villas with no alcohol on the premises — a fully halal-friendly environment for you and your family." },
    { title: "Family-First", desc: "Activities, spaces, and itineraries designed with families in mind — comfortable, joyful, and respectful of your values." },
    { title: "Modest Beach & Pool", desc: "Private beach and pool setups that offer full privacy — enjoy the Caribbean in a space that's entirely yours." },
  ],
  perks: [
    { title: "Alcohol-free environment", desc: "No alcohol is brought into or stored on the property — guaranteed from the moment you arrive." },
    { title: "Private pool & outdoor space", desc: "Your pool, your terrace, your garden — fully private with no shared facilities." },
    { title: "Spacious family layouts", desc: "Multiple bedrooms, living areas, and communal spaces ideal for families and groups." },
    { title: "Prayer-ready setup", desc: "Prayer mats, Qibla direction marked, and daily prayer times provided in every villa." },
    { title: "24/7 halal-aware concierge", desc: "A dedicated concierge who understands your needs and is available around the clock." },
  ],
  activities: [
    { title: "Private Cenotes", desc: "Explore the Yucatán's sacred underground rivers in complete privacy — no public crowds, fully secluded, and perfectly suited for families who value modesty." },
    { title: "Private Beach Setups", desc: "A dedicated stretch of Caribbean coastline reserved just for your group — premium loungers, full service, and the privacy your family deserves." },
    { title: "Mayan Ruins Discovery", desc: "A private guided journey through Chichén Itzá, Tulum, or Cobá — deeply educational, awe-inspiring, and a wonderful experience for children and adults alike." },
    { title: "Private Yacht Excursions", desc: "Sail the Caribbean on a private yacht with your family — snorkeling, island-hopping, and breathtaking views in a space that is entirely your own." },
    { title: "Nature & Eco Experiences", desc: "From jungle walks to wildlife sanctuaries and eco-parks, we design nature-based adventures that kids love and parents appreciate — wholesome and memorable." },
    { title: "Xcaret Parks Access", desc: "Fully arranged access to Xcaret, Xel-Há, Xplor, and more — some of Mexico's most spectacular family-friendly parks, seamlessly coordinated for you." },
  ],
  dining: [
    {
      tag: "Halal Certified · Playa del Carmen",
      name1: "Al Rayan",
      nameEm: "Restaurant",
      desc: "One of the few halal-certified restaurants in the Riviera Maya, Al Rayan offers a warm, welcoming atmosphere with a menu rooted in Middle Eastern flavors and freshly prepared halal ingredients. A trusted choice for Muslim families in the heart of Playa del Carmen.",
      features: [
        "Fully halal-certified kitchen",
        "Middle Eastern & international cuisine",
        "Alcohol-free dining environment",
        "Family-friendly atmosphere",
        "Conveniently located in Playa del Carmen",
      ],
    },
    {
      tag: "Private Service · Any Location",
      name1: "Private Chef with",
      nameEm: "Halal Meat",
      desc: "Prefer to dine at your villa? We arrange a dedicated private chef who sources only halal-certified meats and ingredients — cooking for you at home, beachside, or wherever your day takes you. Fully customized menus, dietary preferences honored, and no compromises on quality or faith.",
      features: [
        "Halal-sourced meat & ingredients only",
        "Custom menus tailored to your preferences",
        "Breakfast, lunch, dinner & special occasions",
        "Served at your villa, beach, or yacht",
        "Available throughout your stay",
      ],
    },
  ],
  trust: [
    { n: "100%", l1: "Halal dining", l2: "guaranteed" },
    { n: "24/7", l1: "Dedicated", l2: "concierge" },
    { n: "0", l1: "Alcohol on", l2: "your premises" },
    { n: "∞", l1: "Memories made", l2: "with family" },
  ],
  promiseList: [
    "Halal food & private chef",
    "Prayer facilities in every villa",
    "Alcohol-free private accommodations",
    "Modest private beach & pool",
    "Family-oriented activities",
    "Muslim-aware concierge team",
    "Full trip planning & coordination",
  ],
};

/* All visitor-facing text for the VIP page. Kept in a plain module (no
   "use client") so the server page can translate it and pass it to the
   client component as a prop. Icons live in VipClient and are matched to
   SERVICES/ACTIVITIES by index. */

export type VipTextItem = { title: string; desc: string };
export type VipAccom = { tag: string; name: string; desc: string; ideal: string };

export type VipContent = {
  heroBadge: string;
  heroTitle1: string;
  heroTitleEm: string;
  heroSub: string;
  introTitle1: string;
  introTitleEm: string;
  introText: string;
  logoTagline: string;
  servicesEyebrow: string;
  servicesTitle1: string;
  servicesTitleEm: string;
  activitiesEyebrow: string;
  activitiesTitle1: string;
  activitiesTitleEm: string;
  browseBefore: string;
  browseLink: string;
  browseAfter: string;
  accomEyebrow: string;
  accomTitle1: string;
  accomTitleEm: string;
  includedLabel: string;
  includedQuote: string;
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
  services: VipTextItem[];
  activities: VipTextItem[];
  accoms: VipAccom[];
  includedList: string[];
};

export const VIP_CONTENT_EN: VipContent = {
  heroBadge: "Exclusive Access",
  heroTitle1: "VIP Experience –",
  heroTitleEm: "Luxury Without Limits",
  heroSub: "Riviera Maya · Private · Personalized",
  introTitle1: "A journey built entirely",
  introTitleEm: "around you.",
  introText:
    "Step into a world where every detail is designed around you. The VIP Experience is more than a package — it's a fully personalized journey where comfort, exclusivity, and freedom come together to create something truly unforgettable.",
  logoTagline: "Trust in Adventure.",
  servicesEyebrow: "What We Offer",
  servicesTitle1: "VIP",
  servicesTitleEm: "Services",
  activitiesEyebrow: "Experiences Await",
  activitiesTitle1: "Exclusive",
  activitiesTitleEm: "Activities",
  browseBefore: "Browse our curated",
  browseLink: "activities",
  browseAfter: "and transform any experience into a fully private, personalized journey.",
  accomEyebrow: "Where You'll Stay",
  accomTitle1: "Accommodation",
  accomTitleEm: "Options",
  includedLabel: "What's Included",
  includedQuote: "Your experience. Your pace. Your rules.",
  bodyParas: [
    "From the moment you arrive, everything is taken care of. Enjoy private transportation, handpicked luxury accommodations in Playa del Carmen, Tulum, or beyond, and a dedicated concierge available 24/7 to handle every request.",
    "Indulge in private tours, exclusive beach setups, yacht experiences across the Caribbean, and access to the most beautiful and hidden locations in the region. From a private chef preparing your meals to customized activities and seamless planning, every moment is crafted to deliver the highest level of comfort and sophistication.",
    "Whether you're looking for relaxation, adventure, or celebration, your experience is built entirely around your preferences. There are no fixed schedules, no limitations — only possibilities. Whether it's a romantic escape, a family getaway, or a special celebration, everything can be arranged to match your vision.",
  ],
  ctaEyebrow: "Begin Your Journey",
  ctaHeadline1: "Ready to experience the",
  ctaHeadlineEm: "extraordinary?",
  ctaPrimary: "Request VIP Experience",
  ctaSecondary: "Explore All Activities",
  modalEyebrow: "Begin Your Journey",
  modalTitle: "Request Your VIP Experience",
  modalText:
    "Tell us a little about your trip — dates, group size, and what you're dreaming of — and our team will reach out to design a fully private, VIP-tailored journey just for you.",
  modalWhatsApp: "Send via WhatsApp",
  modalEmail: "Send via Email",
  mantra1: "Your experience.",
  mantra2: "Your pace.",
  mantra3: "Your rules.",
  services: [
    { title: "Private Transportation", desc: "From the moment you land, luxury vehicles and a personal driver are ready. No waiting, no sharing — just seamless arrivals and departures." },
    { title: "Dedicated Local Guide", desc: "Your expert guide unlocks the real Riviera Maya — from hidden ruins to local markets, with stories, knowledge, and access no map can provide." },
    { title: "24/7 Dedicated Concierge", desc: "Your personal concierge handles every request, anticipates every need, and ensures your experience is flawless from start to finish." },
    { title: "Yacht & Ocean Experiences", desc: "Private yacht excursions across the Caribbean, exclusive beach setups, and access to the most breathtaking hidden spots in the region." },
    { title: "Private Chef & Dining", desc: "Gourmet meals prepared exclusively for you — whether beachside, aboard a yacht, or in the privacy of your villa." },
    { title: "Custom Itineraries", desc: "No fixed schedules. No limitations. Every day is built around your preferences — adventure, relaxation, celebration, or all three." },
  ],
  activities: [
    { title: "Private Cenotes", desc: "Descend into the sacred underground rivers of the Yucatán Peninsula — crystal-clear, secluded, and completely private. An experience unlike anywhere else on earth." },
    { title: "Semi-Private Beaches", desc: "Exclusive beach setups with premium loungers and full service. Discover hidden stretches of coastline away from the crowds, reserved just for you." },
    { title: "Private Yacht Snorkeling & Island Exploration", desc: "Set sail on a private yacht and dive into vibrant coral reefs, discover secluded islands, and explore untouched Caribbean waters — all at your own pace." },
    { title: "Mayan Ruins Discovery Experience", desc: "Step back in time with a private guided tour of the Yucatán's most iconic Mayan sites — Chichén Itzá, Tulum, Cobá, and more — with expert storytelling and no crowds." },
    { title: "Helicopter Tours", desc: "Rise above the jungle canopy and Caribbean coast for an aerial perspective that transforms the landscape into art. Tailored routes, private flights." },
    { title: "Access to All Xcaret Parks", desc: "Seamlessly arranged access to the full suite of Xcaret experiences — Xcaret, Xplor, Xel-Há, and beyond — all handled and coordinated for you." },
  ],
  accoms: [
    { tag: "", name: "Private Luxury Villas", desc: "Maximum privacy and flexibility for families and groups. Enjoy your own space with a private pool, chef options, and fully personalized services — the ultimate exclusive stay.", ideal: "Families, groups & maximum privacy" },
    { tag: "Prestige", name: "Rosewood Mayakoba", desc: "One of the most prestigious resorts in the region — ultra-luxury suites and villas with private pools and butler service. The pinnacle of refined elegance and privacy.", ideal: "High-end travelers & top-tier service" },
    { tag: "", name: "Banyan Tree Mayakoba", desc: "A serene villa-only resort surrounded by nature, with private pool villas and a peaceful, exotic atmosphere. Tranquility and privacy in perfect harmony.", ideal: "Couples seeking tranquility & ambiance" },
    { tag: "", name: "Fairmont Mayakoba", desc: "A premium resort set within lush jungle and waterways, offering a beautiful balance between comfort, nature, and high-end amenities in a spacious setting.", ideal: "Nature lovers who want luxury & space" },
    { tag: "One of a Kind", name: "Palafitos Overwater Bungalows", desc: "The only overwater bungalows in Mexico — a Maldives-style experience with direct ocean access, private pools, and breathtaking views. Perfect for unforgettable occasions.", ideal: "Couples, honeymoons & special occasions" },
    { tag: "", name: "Hotel Xcaret Mexico", desc: "An all-inclusive resort with access to multiple parks, experiences, and entertainment. Dynamic, vibrant, and packed with unforgettable moments all in one place.", ideal: "Families & activity-filled adventures" },
  ],
  includedList: [
    "Private tours & exclusive access",
    "Luxury beach setups",
    "Romantic, family & celebration packages",
    "Customized activities & planning",
    "Hidden gems of the Riviera Maya",
    "Seamless, full-service coordination",
    "Private cenotes & helicopter tours",
    "Full Xcaret parks access",
  ],
};

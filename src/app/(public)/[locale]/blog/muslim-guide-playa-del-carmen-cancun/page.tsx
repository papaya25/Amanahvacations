import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { SITE_URL, breadcrumbSchema, faqSchema, pageAlternates } from "@/lib/seo";

/* Muslim travel guide — an editorial article and SEO landing page (not in the
   menu or on the home page by Maher's choice; reached from /halal, /blog and
   the sitemap). Listed in src/lib/blog.ts. Every fact comes from Maher, who lives in Playa del Carmen:
   docs/seo/muslim-guide-facts-from-maher.md. Photos are his. No fixed
   prayer-time table (times change); link the mosque's website once live. */

const PATH = "/blog/muslim-guide-playa-del-carmen-cancun";
const UPDATED = "2026-11-18";
const HERO = "/images/guide/muslim-traveler-tulum-terrace.jpg";
const FAMILY = "/images/guide/muslim-family-villa-dinner.jpg";

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizeMetadata(locale, {
    title: "Muslim Travel Guide to Playa del Carmen & Cancún: Mosques, Halal Food, Prayer",
    description:
      "A local guide for Muslim travelers: the mosque in Playa del Carmen and Friday prayer, the Cancún musalla, halal restaurants and halal meat, kosher and seafood options, burkini tips and where to stay.",
    keywords: [
      "mosque Playa del Carmen",
      "mosque Cancun",
      "halal food Playa del Carmen",
      "halal restaurant Cancun",
      "Muslim travel Riviera Maya",
      "Muslims in Playa del Carmen",
      "halal vacation Mexico",
    ],
    alternates: pageAlternates(locale, PATH),
    openGraph: {
      type: "article",
      title: "Muslim Travel Guide to Playa del Carmen & Cancún",
      description: "Mosques, Friday prayer, halal food and practical tips — from a Muslim-owned tour operator in Playa del Carmen.",
      url: localizeHref(PATH, isLocale(locale) ? locale : "en"),
      images: [HERO],
    },
  });
}

/* ---------- Content (English source; translated per locale) ---------- */

const INTRO = [
  "Before they book, almost every Muslim family asks us the same questions. Is there a mosque? Where can we eat halal? Will my wife and daughters feel comfortable in a hijab, or in a burkini at the beach? The short answer is yes — and the longer answer is what this guide is for.",
  "We are Amanah Vacations, a Muslim-owned tour operator based in Playa del Carmen. We live here, we pray here and we eat here, so everything on this page comes from our own experience on the ground rather than from lists copied around the internet. We keep it up to date as places open and close.",
  "Playa del Carmen is the heart of Muslim life on the Riviera Maya: it has the region's mosque, its halal restaurants and its halal meat supplier. Cancún, about an hour to the north, has a small musalla. Here is what each city offers, and how to make the most of your stay.",
];

const MOSQUES = {
  title: "Mosques and Friday prayer",
  intro:
    "You will not have to choose between your holiday and your prayers. Playa del Carmen has a real mosque with a full program, and Cancún has a prayer room for the days you are staying further north.",
  items: [
    {
      city: "Playa del Carmen",
      name: "Masjid Al-Rahman",
      kind: "Mosque",
      address: "Calle 3 Sur & Calle 60 Diagonal Sur, Ejidal, 77712 Playa del Carmen",
      q: "Masjid Al-Rahman Calle 3 Sur Ejidal Playa del Carmen",
      paras: [
        "Masjid Al-Rahman is a real, large mosque — not a prayer room in an apartment — and it is the centre of the Muslim community on the Riviera Maya. Its imam studied at Al-Azhar in Egypt.",
        "Jumu'ah is held every Friday at 2 pm, and the khutbah is given in a mix of Spanish and Arabic, so visitors from abroad can follow along.",
        "During Ramadan the mosque holds Tarawih prayers and iftar, and all year long it runs Islamic classes and Quran classes for adults and children. On both Eids, Muslims from all over the Riviera Maya gather here — if your trip falls on Eid, this is where you will want to pray.",
      ],
    },
    {
      city: "Cancún",
      name: "Masjid Al-Rahim",
      kind: "Musalla (prayer room)",
      address: "Calle Alce 24, 77500 Cancún",
      q: "Masjid Al-Rahim Calle Alce 24 Cancun",
      paras: [
        "Cancún does not have a full mosque, but Masjid Al-Rahim is a musalla — a prayer room — serving the Muslims who live in and visit the city.",
        "If you are staying in Cancún and want to attend Jumu'ah or the Eid prayer, plan the drive to Masjid Al-Rahman in Playa del Carmen, about an hour away.",
      ],
    },
  ],
};

const COMMUNITY = {
  title: "The Muslim community",
  paras: [
    "Roughly 250 to 300 Muslims live between Cancún, Playa del Carmen and Tulum. It is a small community, but a close and welcoming one, and it comes together at Masjid Al-Rahman — every Friday, throughout Ramadan, and above all on both Eids, when Muslims from across the Riviera Maya gather in Playa del Carmen.",
    "Emara Academy is part of that community life: it does da'wa and organizes classes and activities for Muslims and for new converts.",
  ],
  emaraCta: "Visit Emara Academy →",
};

type Place = { name: string; address: string; desc: string };
const FOOD = {
  title: "Halal food in Playa del Carmen",
  intro:
    "Playa del Carmen is the easiest place on the Riviera Maya to eat halal. Here are the places we know and trust, one by one. In Cancún we don't know of a halal restaurant — there, seafood, fish and vegetarian dishes are the way to go, or plan your meals around a visit to Playa.",
  groups: [
    {
      title: "Halal restaurants & halal meat",
      intro: "Restaurants that serve halal meat — read each note, because ownership and alcohol policies differ.",
      places: [
        { name: "French Kebab", address: "", desc: "Owned by a Muslim and serves only halal food. It is also where to buy halal meat: the owner is Playa del Carmen's only halal meat supplier, so if you are cooking in your apartment or villa, ask here and they will provide what you need." },
        { name: "Ar Rayan", address: "", desc: "Owned by the same Muslim owner as French Kebab, and serves only halal food." },
        { name: "Street Food Latino", address: "", desc: "Serves halal meat. The owner is not Muslim." },
        { name: "Shaywarma", address: "", desc: "Serves halal meat." },
        { name: "Los Faraones", address: "", desc: "Serves halal meat." },
        { name: "Tacos & Kebab Express", address: "", desc: "Serves halal meat, but may also sell beer." },
      ] as Place[],
    },
    {
      title: "Kosher restaurants",
      intro: "Some Muslim travelers also eat at kosher restaurants — follow your own school of thought.",
      places: [
        { name: "Moshe Cube Kosher", address: "", desc: "Kosher restaurant." },
        { name: "Two Smokers Smokehouse", address: "", desc: "Kosher smokehouse." },
        { name: "Let's Meat Kosher Steak House", address: "", desc: "Kosher steak house." },
      ] as Place[],
    },
    {
      title: "Vegetarian & seafood",
      intro: "Playa del Carmen has plenty of seafood and fish restaurants, and they are an easy choice anywhere on the coast. We will keep adding our favorites to this list.",
      places: [
        { name: "Falafel Nassaya", address: "", desc: "Falafel and vegetarian Middle Eastern plates." },
      ] as Place[],
    },
  ],
};

const PRAYER = {
  title: "Prayer times and qibla",
  paras: [
    "Daily prayer times change through the year, so the simplest approach is your usual prayer app set to Cancún or Playa del Carmen. Quintana Roo keeps the same clock all year — there is no daylight saving to catch you out.",
    "The qibla from Cancún and Playa del Carmen is about 54° from true north, toward the north-east — Makkah is around 12,540 km away.",
  ],
};

const MODEST = {
  title: "Hijab, burkini and the beach",
  paras: [
    "There is no law in Mexico against modest swimwear, and you will not need one. The hijab is fine everywhere, and people here are very respectful.",
    "The burkini is fine at the public beaches, at the cenotes and at the parks — wear what you are comfortable in and enjoy the water.",
  ],
};

const STAY = {
  title: "Where to stay",
  paras: [
    "There is no halal-certified hotel in the area. You can ask a hotel to keep alcohol out of your room, but the food in its restaurants won't be halal.",
    "That is why many Muslim families prefer an Airbnb or a resort condo with its own kitchen, where you can cook with halal meat from Playa del Carmen. Our partner TutCasa has a splendid condo in Mareazul that works beautifully for families.",
  ],
  cta: "See TutCasa →",
};

const TOURS = {
  title: "Tours designed for Muslim families",
  paras: [
    "Every Amanah tour is designed for Muslim families. Our tours are private, so you never share transport with strangers.",
    "When something has to be shared — like a snorkeling boat, where a private one would be very expensive for a family — there is no alcohol and no music on board. We bring a prayer carpet so you can pray during the tour whenever you need to. Please note that food is not included on our tours.",
  ],
  ctaHalal: "Our halal-friendly travel",
  ctaTours: "See our private tours",
};

const FAQS = [
  {
    q: "Is there a mosque in Playa del Carmen?",
    a: "Yes. Masjid Al-Rahman, in the Ejidal neighborhood (Calle 3 Sur & Calle 60 Diagonal Sur), is a real, large mosque with an imam trained at Al-Azhar. It holds Friday prayer every week, Tarawih and iftar in Ramadan, Eid prayers for the whole Riviera Maya, and classes all year.",
  },
  {
    q: "When is Friday prayer (Jumu'ah) in Playa del Carmen?",
    a: "Every Friday at 2 pm at Masjid Al-Rahman, Calle 3 Sur & Calle 60 Diagonal Sur, Ejidal. The khutbah is in a mix of Spanish and Arabic.",
  },
  {
    q: "Is there a mosque in Cancún?",
    a: "Cancún has a musalla (prayer room), Masjid Al-Rahim, at Calle Alce 24. For Friday prayer and the Eid prayers, Masjid Al-Rahman in Playa del Carmen is about an hour's drive south.",
  },
  {
    q: "Where can I eat halal food in Playa del Carmen?",
    a: "French Kebab and Ar Rayan are Muslim-owned and serve only halal food. Street Food Latino, Shaywarma, Los Faraones and Tacos & Kebab Express also serve halal meat — Tacos & Kebab Express may sell beer. Seafood and vegetarian options are everywhere.",
  },
  {
    q: "Is there halal food in Cancún?",
    a: "We don't know of a halal restaurant in Cancún itself. Most Muslim visitors eat seafood, fish and vegetarian dishes there, or plan their meals around Playa del Carmen's halal restaurants.",
  },
  {
    q: "Can I buy halal meat in Playa del Carmen?",
    a: "Yes. There is one halal meat supplier in Playa del Carmen — the owner of Ar Rayan and French Kebab. Ask at French Kebab and they will provide what you need.",
  },
  {
    q: "Can I wear a hijab or burkini at the beach, cenotes and parks?",
    a: "Yes. There is no law against it, the hijab is fine everywhere, and people here are very respectful — the burkini is fine at the beaches, cenotes and parks.",
  },
  {
    q: "Are there halal hotels in the Riviera Maya?",
    a: "There is no halal-certified hotel. You can ask for no alcohol in your room, but the hotel food won't be halal — which is why many Muslim families prefer an Airbnb or a resort condo with a kitchen, like our partner TutCasa's condo in Mareazul.",
  },
  {
    q: "Are your tours halal-friendly?",
    a: "Yes — every Amanah tour is designed for Muslim families. Tours are private, there is no alcohol or music, and we bring a prayer carpet if you want to pray during the tour. See our [halal-friendly private tours](/halal).",
  },
];

const LABELS = [
  "Muslim travel guide · Riviera Maya",
  "Muslims in Playa del Carmen & Cancún",
  "A local guide to mosques, halal food and Muslim life on the Riviera Maya",
  "By Amanah Vacations, Playa del Carmen",
  "Updated",
  "Get directions →",
  "Directions",
  "Muslim travel — your questions answered",
  "Good to know",
  "In this guide",
  "A Muslim family dinner by the pool at a private villa",
  "A traveler in a hijab looking out over the Tulum ruins and the Caribbean at sunset",
];

export default async function MuslimGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const L = (href: string) => localizeHref(href, locale);

  // Flatten every English string, translate in one call, then read back in order.
  const src: string[] = [];
  const put = (s: string) => (src.push(s), src.length - 1);
  const ids = {
    labels: LABELS.map(put),
    intro: INTRO.map(put),
    mosques: {
      title: put(MOSQUES.title),
      intro: put(MOSQUES.intro),
      items: MOSQUES.items.map((m) => ({ kind: put(m.kind), paras: m.paras.map(put) })),
    },
    community: { title: put(COMMUNITY.title), paras: COMMUNITY.paras.map(put), cta: put(COMMUNITY.emaraCta) },
    food: {
      title: put(FOOD.title),
      intro: put(FOOD.intro),
      groups: FOOD.groups.map((g) => ({ title: put(g.title), intro: put(g.intro), descs: g.places.map((p) => put(p.desc)) })),
    },
    prayer: { title: put(PRAYER.title), paras: PRAYER.paras.map(put) },
    modest: { title: put(MODEST.title), paras: MODEST.paras.map(put) },
    stay: { title: put(STAY.title), paras: STAY.paras.map(put), cta: put(STAY.cta) },
    tours: { title: put(TOURS.title), paras: TOURS.paras.map(put), ctaHalal: put(TOURS.ctaHalal), ctaTours: put(TOURS.ctaTours) },
    faqQ: FAQS.map((f) => put(f.q)),
    faqA: FAQS.map((f) => put(f.a)),
  };
  const tr = await translateMany(src, locale);
  const T = (i: number) => tr[i];
  const [eyebrow, h1, subtitle, byline, labelUpdated, labelDirections, labelMap, faqHeading, faqEyebrow, labelToc, altFamily, altHero] =
    ids.labels.map(T);
  const faqs = FAQS.map((_, i) => ({ q: T(ids.faqQ[i]), a: T(ids.faqA[i]) }));

  const toc = [
    { id: "mosques", label: T(ids.mosques.title) },
    { id: "community", label: T(ids.community.title) },
    { id: "food", label: T(ids.food.title) },
    { id: "prayer", label: T(ids.prayer.title) },
    { id: "modest", label: T(ids.modest.title) },
    { id: "stay", label: T(ids.stay.title) },
    { id: "tours", label: T(ids.tours.title) },
  ];

  const url = `${SITE_URL}${L(PATH)}`;
  const date = new Date(UPDATED).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

  const h2 = "font-serif text-[clamp(28px,3vw,40px)] font-semibold leading-[1.08] tracking-[-0.5px] text-ink";
  const prose = "space-y-5 text-[clamp(15px,1.1vw,17px)] leading-[1.9] text-ink/80";
  const section = "scroll-mt-28 border-t border-sand pt-[clamp(40px,5vw,64px)] mt-[clamp(40px,5vw,64px)]";
  const link = "font-semibold text-forest underline underline-offset-2 hover:text-terracotta";

  return (
    <main className="bg-cream">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Muslim Travel Guide to Playa del Carmen & Cancún",
            description: INTRO[0],
            inLanguage: locale,
            image: `${SITE_URL}${HERO}`,
            datePublished: "2026-11-17",
            dateModified: UPDATED,
            mainEntityOfPage: url,
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          ...MOSQUES.items.map((m) => ({
            "@context": "https://schema.org",
            "@type": m.kind === "Mosque" ? "Mosque" : "PlaceOfWorship",
            name: m.name,
            address: m.address,
            hasMap: maps(m.q),
          })),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: "Muslim Travel Guide", path: PATH },
          ]),
          faqSchema(FAQS),
        ]}
      />

      {/* Hero */}
      <section className="relative flex min-h-[62vh] items-end overflow-hidden md:min-h-[72vh]">
        <Image src={HERO} alt={altHero} unoptimized fill priority sizes="100vw" className="object-cover object-[60%_center]" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,16,0.86) 0%, rgba(10,26,16,0.35) 50%, rgba(10,26,16,0) 80%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1100px] px-5 pb-[clamp(32px,5vw,64px)] pt-24 lg:px-8">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-gold" />
            {eyebrow}
          </div>
          <h1 className="max-w-[820px] font-serif text-[clamp(38px,5.4vw,70px)] font-semibold leading-[1.0] tracking-[-1px] text-white">
            {h1}
          </h1>
          <p className="mt-4 max-w-[620px] font-serif text-[clamp(18px,1.7vw,23px)] italic leading-[1.4] text-white/85">
            {subtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1100px] gap-[clamp(32px,4vw,64px)] px-5 py-[clamp(44px,6vw,88px)] lg:grid-cols-[1fr_240px] lg:px-8">
        <article className="min-w-0 max-w-[720px]">
          <p className="mb-8 text-[11.5px] font-semibold uppercase tracking-[2px] text-sage">
            {byline} · {labelUpdated} <time dateTime={UPDATED}>{date}</time>
          </p>

          {/* Introduction */}
          <div className={prose}>
            <p className="font-serif text-[clamp(20px,1.8vw,25px)] leading-[1.55] text-ink first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[3.4em] first-letter:leading-[0.85] first-letter:text-terracotta">
              {T(ids.intro[0])}
            </p>
            {ids.intro.slice(1).map((i) => (
              <p key={i}>{T(i)}</p>
            ))}
          </div>

          {/* Mosques */}
          <section id="mosques" className={section}>
            <h2 className={h2}>{T(ids.mosques.title)}</h2>
            <p className={`mt-5 ${prose}`}>{T(ids.mosques.intro)}</p>
            {MOSQUES.items.map((m, i) => (
              <div key={m.name} className="mt-10">
                <div className="text-[10.5px] font-semibold uppercase tracking-[2.5px] text-terracotta">
                  {m.city} · {T(ids.mosques.items[i].kind)}
                </div>
                <h3 className="mt-1.5 font-serif text-[clamp(24px,2.2vw,30px)] font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-[14px] text-sage">
                  {m.address} ·{" "}
                  <a href={maps(m.q)} target="_blank" rel="noopener noreferrer" aria-label={`${labelMap}: ${m.name}`} className={link}>
                    {labelDirections}
                  </a>
                </p>
                <div className={`mt-4 ${prose}`}>
                  {ids.mosques.items[i].paras.map((p) => (
                    <p key={p}>{T(p)}</p>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Community */}
          <section id="community" className={section}>
            <h2 className={h2}>{T(ids.community.title)}</h2>
            <div className={`mt-5 ${prose}`}>
              {ids.community.paras.map((p) => (
                <p key={p}>{T(p)}</p>
              ))}
              <p>
                <a href="https://emaraacademy.org" target="_blank" rel="noopener" className={link}>
                  {T(ids.community.cta)}
                </a>
              </p>
            </div>
          </section>

          {/* Food */}
          <section id="food" className={section}>
            <h2 className={h2}>{T(ids.food.title)}</h2>
            <p className={`mt-5 ${prose}`}>{T(ids.food.intro)}</p>
            {FOOD.groups.map((g, gi) => (
              <div key={g.title} className="mt-10">
                <h3 className="font-serif text-[clamp(22px,2vw,27px)] font-semibold text-ink">{T(ids.food.groups[gi].title)}</h3>
                <p className="mt-2 text-[15px] leading-[1.8] text-sage">{T(ids.food.groups[gi].intro)}</p>
                <ol className="mt-5 space-y-4">
                  {g.places.map((p, pi) => (
                    <li key={p.name} className="rounded-[16px] border border-sand bg-white px-5 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="font-serif text-[20px] font-semibold text-ink">{p.name}</h4>
                        <a
                          href={maps(`${p.name} ${p.address || "Playa del Carmen"}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${labelMap}: ${p.name}`}
                          className="text-[13px] font-semibold text-forest underline underline-offset-2 hover:text-terracotta"
                        >
                          {labelDirections}
                        </a>
                      </div>
                      {p.address && <p className="mt-0.5 text-[13.5px] text-sage">{p.address}</p>}
                      <p className="mt-2 text-[15px] leading-[1.75] text-ink/80">{T(ids.food.groups[gi].descs[pi])}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>

          {/* Prayer */}
          <section id="prayer" className={section}>
            <h2 className={h2}>{T(ids.prayer.title)}</h2>
            <div className={`mt-5 ${prose}`}>
              {ids.prayer.paras.map((p) => (
                <p key={p}>{T(p)}</p>
              ))}
            </div>
          </section>

          {/* Modest swimwear */}
          <section id="modest" className={section}>
            <h2 className={h2}>{T(ids.modest.title)}</h2>
            <div className={`mt-5 ${prose}`}>
              {ids.modest.paras.map((p) => (
                <p key={p}>{T(p)}</p>
              ))}
            </div>
          </section>

          {/* Stay */}
          <section id="stay" className={section}>
            <h2 className={h2}>{T(ids.stay.title)}</h2>
            <figure className="relative mt-6 aspect-[16/8] overflow-hidden rounded-[20px]">
              <Image src={FAMILY} alt={altFamily} fill unoptimized sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" />
            </figure>
            <div className={`mt-6 ${prose}`}>
              {ids.stay.paras.map((p) => (
                <p key={p}>{T(p)}</p>
              ))}
              <p>
                <a href="https://tutcasa.com" target="_blank" rel="noopener" className={link}>
                  {T(ids.stay.cta)}
                </a>
              </p>
            </div>
          </section>

          {/* Tours */}
          <section id="tours" className="mt-[clamp(40px,5vw,64px)] scroll-mt-28">
            <div className="rounded-[24px] bg-night px-[clamp(22px,3vw,44px)] py-[clamp(30px,4vw,48px)]">
              <h2 className="font-serif text-[clamp(26px,2.8vw,36px)] font-semibold text-white">{T(ids.tours.title)}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-[1.85] text-white/75">
                {ids.tours.paras.map((p) => (
                  <p key={p}>{T(p)}</p>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={L("/halal")}
                  className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-center text-[14px] font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {T(ids.tours.ctaHalal)}
                </Link>
                <Link
                  href={L("/tours")}
                  className="rounded-full border-[1.5px] border-white/40 px-6 py-3 text-center text-[14px] font-medium text-white transition hover:border-white hover:bg-white hover:text-ink"
                >
                  {T(ids.tours.ctaTours)}
                </Link>
              </div>
            </div>
          </section>
        </article>

        {/* Table of contents (desktop) */}
        <aside className="hidden lg:block">
          <nav aria-label={labelToc} className="sticky top-[108px] border-l border-sand pl-5">
            <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[2.5px] text-terracotta">{labelToc}</div>
            <ol className="space-y-2.5 text-[14px] leading-snug">
              {toc.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-ink/70 transition hover:text-forest">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>

      <Faq items={faqs} heading={faqHeading} eyebrow={faqEyebrow} />
    </main>
  );
}

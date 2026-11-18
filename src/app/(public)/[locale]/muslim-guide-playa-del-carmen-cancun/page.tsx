import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { IconMosque, IconDining, IconCompass, IconWaves, IconVilla, IconFamily } from "@/components/LuxeIcons";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { SITE_URL, breadcrumbSchema, faqSchema, pageAlternates } from "@/lib/seo";

/* Muslim travel guide — an SEO landing page (not in the menu or on the home
   page by Maher's choice; reached from /halal and the sitemap). Every fact
   comes from Maher, who lives in Playa del Carmen:
   docs/seo/muslim-guide-facts-from-maher.md. No fixed prayer-time table
   (times change); link the mosque's website here once it's live. */

const PATH = "/muslim-guide-playa-del-carmen-cancun";
const UPDATED = "2026-11-17";

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
      "A local's guide for Muslim travelers: the mosque in Playa del Carmen, the Cancún musalla, halal restaurants and halal meat, prayer times, qibla, burkini tips and where to stay.",
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
      description: "Mosques, halal food, prayer times and practical tips — from a local Muslim-owned tour operator.",
      url: localizeHref(PATH, isLocale(locale) ? locale : "en"),
      images: ["/images/dest/quinta-hero.jpg"],
    },
  });
}

const MOSQUES = [
  {
    city: "Playa del Carmen",
    name: "Masjid Al-Rahman",
    kind: "Mosque",
    address: "Calle 3 Sur & Calle 60 Diagonal Sur, Ejidal, 77712 Playa del Carmen",
    desc: "A real, large mosque with an imam trained at Al-Azhar in Egypt. Jumu'ah is held every Friday at 2 pm, with the khutbah in a mix of Spanish and Arabic. In Ramadan it holds Tarawih prayers and iftar; all year long it runs Islamic classes and Quran classes for adults and children. On both Eids, Muslims from all over the Riviera Maya gather here.",
    q: "Masjid Al-Rahman Calle 3 Sur Ejidal Playa del Carmen",
  },
  {
    city: "Cancún",
    name: "Masjid Al-Rahim",
    kind: "Musalla (prayer room)",
    address: "Calle Alce 24, 77500 Cancún",
    desc: "A musalla — a prayer room rather than a full mosque — serving Muslims living in and visiting Cancún.",
    q: "Masjid Al-Rahim Calle Alce 24 Cancun",
  },
];

const FOOD = [
  {
    title: "Fully halal, Muslim-owned",
    places: ["French Kebab", "Ar Rayan"],
    note: "Both are owned by a Muslim and serve only halal food.",
  },
  {
    title: "Halal meat, non-Muslim owner",
    places: ["Street Food Latino"],
    note: "Serves halal meat; the owner is not Muslim.",
  },
  {
    title: "Halal meat, but beer may be served",
    places: ["Shawarma", "Los Faraones Tacos & Kebab Express"],
    note: "The meat is halal, but these places may also sell beer.",
  },
  {
    title: "Vegetarian",
    places: ["Falafel Nassaya"],
    note: "Falafel and vegetarian Middle Eastern plates.",
  },
  {
    title: "Kosher",
    places: ["Moshe Cube Kosher", "Two Smokers Smokehouse", "Let's Meat Kosher Steak House"],
    note: "Some Muslim travelers also eat at kosher restaurants — follow your own school of thought.",
  },
];


const FAQS = [
  {
    q: "Is there a mosque in Playa del Carmen?",
    a: "Yes. Masjid Al-Rahman, in the Ejidal neighborhood (Calle 3 Sur & Calle 60 Diagonal Sur), is a real, large mosque with an imam trained at Al-Azhar. Jumu'ah is every Friday at 2 pm; it also holds Tarawih and iftar in Ramadan, Eid prayers for the whole Riviera Maya, and classes all year.",
  },
  {
    q: "When is Friday prayer (Jumu'ah) in Playa del Carmen?",
    a: "Every Friday at 2 pm at Masjid Al-Rahman, Calle 3 Sur & Calle 60 Diagonal Sur, Ejidal. The khutbah is in a mix of Spanish and Arabic.",
  },
  {
    q: "Is there a mosque in Cancún?",
    a: "Cancún has a musalla (prayer room), Masjid Al-Rahim, at Calle Alce 24. For the full mosque experience, Masjid Al-Rahman in Playa del Carmen is about an hour's drive south.",
  },
  {
    q: "Where can I eat halal food in Playa del Carmen?",
    a: "French Kebab and Ar Rayan are Muslim-owned and serve only halal food. Street Food Latino, Shawarma and Los Faraones Tacos & Kebab Express also serve halal meat (the last two may sell beer). Seafood and vegetarian options are everywhere.",
  },
  {
    q: "Is there halal food in Cancún?",
    a: "We don't know of a halal restaurant in Cancún itself. Most Muslim visitors eat seafood, fish and vegetarian dishes there, or make the trip to Playa del Carmen's halal restaurants.",
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

export default async function MuslimGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const L = (href: string) => localizeHref(href, locale);

  const S = [
    "Muslim travel guide · Riviera Maya",
    "Muslims in Playa del Carmen & Cancún",
    "Yes — Playa del Carmen has a real mosque, with an imam from Al-Azhar, Friday prayer every week at 2 pm, Ramadan Tarawih and iftar, and classes all year. Cancún has a musalla. Halal restaurants and halal meat are in Playa del Carmen; the hijab and burkini are welcome everywhere. This guide is written by Amanah Vacations, a Muslim-owned tour operator based in Playa del Carmen.",
    "Mosques & prayer spaces",
    "Get directions →",
    "The Muslim community",
    "Roughly 250 to 300 Muslims live between Cancún, Playa del Carmen and Tulum — a small, welcoming community that comes together at Masjid Al-Rahman, especially for Friday prayer, in Ramadan, and on both Eids, when Muslims from across the Riviera Maya gather there.",
    "Emara Academy does da'wa and organizes classes and activities for Muslims and new converts.",
    "Visit Emara Academy →",
    "Halal food in Playa del Carmen",
    "Plenty of seafood and fish restaurants make easy choices too. In Cancún we don't know of a halal restaurant — seafood, fish and vegetarian dishes are the way to go.",
    "Buying halal meat",
    "There is one halal meat supplier in Playa del Carmen — the owner of Ar Rayan and French Kebab. If you are cooking in your apartment or villa, ask at French Kebab for halal meat and they will provide what you need.",
    "Friday prayer, prayer times & qibla",
    "Jumu'ah is held every Friday at 2 pm at Masjid Al-Rahman in Playa del Carmen, with the khutbah in a mix of Spanish and Arabic.",
    "Daily prayer times change through the year, so use your prayer app set to Cancún or Playa del Carmen. Quintana Roo keeps the same clock all year — there is no daylight saving.",
    "Qibla: about 54° from true north (north-east), toward Makkah — around 12,540 km away.",
    "Hijab, burkini & the beach",
    "There is no law against modest swimwear. The hijab is fine everywhere and people here are very respectful, so the burkini is fine at the public beaches, the cenotes and the parks.",
    "Where to stay",
    "There is no halal-certified hotel in the area. You can ask a hotel for no alcohol in your room, but the food won't be halal. Many Muslim families prefer an Airbnb or a resort condo with its own kitchen — like the splendid condo of our partner TutCasa in Mareazul.",
    "See TutCasa →",
    "Halal-friendly tours",
    "Every Amanah tour is designed for Muslim families. Tours are private, so you never share transport with strangers. When something has to be shared — like a snorkeling boat, where a private one would be very expensive for a family — there is no alcohol and no music. We bring a prayer carpet if you want to pray during the tour. Food is not included on our tours.",
    "Our halal-friendly travel",
    "See our private tours",
    "Muslim travel — your questions answered",
    "Good to know",
    "Last updated",
    "Written by Amanah Vacations, Playa del Carmen",
    "Directions",
  ];
  const mosqueTexts = MOSQUES.flatMap((m) => [m.kind, m.desc]);
  const foodTexts = FOOD.flatMap((f) => [f.title, f.note]);
  const all = await translateMany(
    [...S, ...mosqueTexts, ...foodTexts, ...FAQS.map((f) => f.q), ...FAQS.map((f) => f.a)],
    locale
  );
  let c = 0;
  const t = all.slice(c, (c += S.length));
  const mosqueT = all.slice(c, (c += mosqueTexts.length));
  const foodT = all.slice(c, (c += foodTexts.length));
  const faqQ = all.slice(c, (c += FAQS.length));
  const faqA = all.slice(c, (c += FAQS.length));
  const faqs = FAQS.map((_, i) => ({ q: faqQ[i], a: faqA[i] }));
  const [
    eyebrow, h1, lede, hMosques, labelDirections, hCommunity, community, emara, emaraCta,
    hFood, foodNote, hMeat, meat, hPrayer, jumuah, prayerNote, qibla,
    hSwim, swim, hStay, stay, stayCta, hTours, tours, ctaHalal, ctaTours, faqHeading, faqEyebrow,
    labelUpdated, byline, labelMap,
  ] = t;

  const url = `${SITE_URL}${L(PATH)}`;
  const sectionTitle = "font-serif text-[clamp(26px,2.8vw,38px)] font-semibold leading-[1.08] tracking-[-0.5px] text-ink";
  const body = "text-[clamp(14px,1.05vw,15.5px)] leading-[1.85] text-ink/80";
  const icon =
    "h-10 w-10 shrink-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:stroke-terracotta [&_svg]:[stroke-width:1.3] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";

  return (
    <main className="bg-cream">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Muslim Travel Guide to Playa del Carmen & Cancún",
            description: lede,
            inLanguage: locale,
            image: `${SITE_URL}/images/dest/quinta-hero.jpg`,
            datePublished: UPDATED,
            dateModified: UPDATED,
            mainEntityOfPage: url,
            author: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          ...MOSQUES.map((m) => ({
            "@context": "https://schema.org",
            "@type": "Mosque",
            name: m.name,
            address: m.address,
            hasMap: maps(m.q),
          })),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Halal-Friendly Travel", path: "/halal" },
            { name: "Muslim Travel Guide", path: PATH },
          ]),
          faqSchema(FAQS),
        ]}
      />

      {/* Hero */}
      <section className="relative flex min-h-[46vh] items-end overflow-hidden md:min-h-[54vh]">
        <Image
          src="/images/dest/quinta-hero.jpg"
          alt="Quinta Avenida in Playa del Carmen"
          unoptimized
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,16,0.88) 0%, rgba(10,26,16,0.35) 55%, rgba(10,26,16,0.1) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1100px] px-5 pb-[clamp(28px,4vw,56px)] pt-24 lg:px-8">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-gold" />
            {eyebrow}
          </div>
          <h1 className="max-w-[820px] font-serif text-[clamp(34px,4.8vw,62px)] font-semibold leading-[1.02] tracking-[-1px] text-white">
            {h1}
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-[1100px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
        {/* Short answer */}
        <div className="rounded-[22px] border border-sand bg-white p-[clamp(22px,2.5vw,36px)]">
          <p className="font-serif text-[clamp(18px,1.6vw,22px)] leading-[1.6] text-forest">{lede}</p>
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[2px] text-sage">
            {byline} · {labelUpdated}{" "}
            <time dateTime={UPDATED}>
              {new Date(UPDATED).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}
            </time>
          </p>
        </div>

        {/* Mosques */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="mosques">
          <div className="mb-6 flex items-center gap-3">
            <span className={icon}>{IconMosque}</span>
            <h2 id="mosques" className={sectionTitle}>{hMosques}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {MOSQUES.map((m, i) => (
              <div key={m.name} className="rounded-[20px] border border-sand bg-white p-6">
                <div className="text-[10.5px] font-semibold uppercase tracking-[2.5px] text-terracotta">
                  {m.city} · {mosqueT[i * 2]}
                </div>
                <h3 className="mt-1.5 font-serif text-[24px] font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-[13px] text-sage">{m.address}</p>
                <p className={`mt-3 ${body}`}>{mosqueT[i * 2 + 1]}</p>
                <a
                  href={maps(m.q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${labelMap}: ${m.name}`}
                  className="mt-4 inline-block text-[13px] font-semibold text-forest underline underline-offset-2"
                >
                  {labelDirections}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Community */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="community">
          <div className="mb-4 flex items-center gap-3">
            <span className={icon}>{IconFamily}</span>
            <h2 id="community" className={sectionTitle}>{hCommunity}</h2>
          </div>
          <div className={`max-w-[760px] space-y-3 ${body}`}>
            <p>{community}</p>
            <p>
              {emara}{" "}
              <a
                href="https://emaraacademy.org"
                target="_blank"
                rel="noopener"
                className="font-semibold text-forest underline underline-offset-2"
              >
                {emaraCta}
              </a>
            </p>
          </div>
        </section>

        {/* Food */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="food">
          <div className="mb-6 flex items-center gap-3">
            <span className={icon}>{IconDining}</span>
            <h2 id="food" className={sectionTitle}>{hFood}</h2>
          </div>
          <div className="divide-y divide-sand overflow-hidden rounded-[20px] border border-sand bg-white">
            {FOOD.map((f, i) => (
              <div key={f.title} className="grid gap-2 p-5 md:grid-cols-[240px_1fr] md:gap-6">
                <h3 className="font-serif text-[18px] font-semibold text-ink">{foodT[i * 2]}</h3>
                <div>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {f.places.map((p) => (
                      <li key={p}>
                        <a
                          href={maps(`${p} Playa del Carmen`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] font-semibold text-forest underline underline-offset-2"
                        >
                          {p}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[13.5px] leading-[1.7] text-sage">{foodT[i * 2 + 1]}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={`mt-4 max-w-[760px] ${body}`}>{foodNote}</p>

          <h3 className="mt-8 font-serif text-[22px] font-semibold text-ink">{hMeat}</h3>
          <p className={`mt-2 max-w-[760px] ${body}`}>{meat}</p>
        </section>

        {/* Prayer */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="prayer">
          <div className="mb-4 flex items-center gap-3">
            <span className={icon}>{IconCompass}</span>
            <h2 id="prayer" className={sectionTitle}>{hPrayer}</h2>
          </div>
          <p className="max-w-[760px] font-serif text-[clamp(18px,1.6vw,22px)] leading-[1.55] text-forest">{jumuah}</p>
          <p className={`mt-3 max-w-[760px] ${body}`}>{prayerNote}</p>
          <p className="mt-4 font-serif text-[18px] italic text-forest">{qibla}</p>
        </section>

        {/* Swimwear */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="swim">
          <div className="mb-4 flex items-center gap-3">
            <span className={icon}>{IconWaves}</span>
            <h2 id="swim" className={sectionTitle}>{hSwim}</h2>
          </div>
          <p className={`max-w-[760px] ${body}`}>{swim}</p>
        </section>

        {/* Stay */}
        <section className="mt-[clamp(44px,5vw,72px)]" aria-labelledby="stay">
          <div className="mb-4 flex items-center gap-3">
            <span className={icon}>{IconVilla}</span>
            <h2 id="stay" className={sectionTitle}>{hStay}</h2>
          </div>
          <p className={`max-w-[760px] ${body}`}>
            {stay}{" "}
            <a
              href="https://tutcasa.com"
              target="_blank"
              rel="noopener"
              className="font-semibold text-forest underline underline-offset-2"
            >
              {stayCta}
            </a>
          </p>
        </section>

        {/* Tours */}
        <section
          className="mt-[clamp(44px,5vw,72px)] rounded-[24px] bg-night px-[clamp(22px,3vw,48px)] py-[clamp(32px,4vw,52px)]"
          aria-labelledby="tours"
        >
          <h2 id="tours" className="font-serif text-[clamp(26px,2.8vw,38px)] font-semibold text-white">
            {hTours}
          </h2>
          <p className="mt-3 max-w-[720px] text-[14.5px] leading-[1.85] text-white/70">{tours}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={L("/halal")}
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-center text-[14px] font-semibold text-white transition hover:-translate-y-0.5"
            >
              {ctaHalal}
            </Link>
            <Link
              href={L("/tours")}
              className="rounded-full border-[1.5px] border-white/40 px-6 py-3 text-center text-[14px] font-medium text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              {ctaTours}
            </Link>
          </div>
        </section>
      </article>

      <Faq items={faqs} heading={faqHeading} eyebrow={faqEyebrow} />
    </main>
  );
}

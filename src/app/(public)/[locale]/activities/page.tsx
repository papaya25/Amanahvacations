import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getEffectiveDestinations } from "@/lib/content/activities";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Things to Do in the Riviera Maya — Activities & Day Trips",
  description:
    "24 handpicked activities in the Riviera Maya: cenotes, Chichén Itzá, Tulum, snorkeling with turtles in Akumal, Holbox, whale sharks, Xcaret parks and more. Private, family-safe and halal-friendly, from Playa del Carmen.",
  keywords: [
    "things to do Playa del Carmen",
    "Riviera Maya activities",
    "fun activities Playa del Carmen",
    "cenotes Riviera Maya",
    "snorkeling Akumal turtles",
    "whale shark tour",
    "Xcaret Xel-Há Xplor",
    "Chichén Itzá day trip",
  ],
  alternates: { canonical: "/activities" },
  openGraph: {
    type: "website",
    title: "Things to Do in the Riviera Maya — Activities & Day Trips",
    description:
      "24 handpicked private activities across the Riviera Maya & Yucatán — cenotes, ruins, islands, reefs and parks.",
    url: "/activities",
    images: ["/images/act-whaleshark.jpg"],
  },
};

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const DESTINATIONS = await getEffectiveDestinations();
  const titles = await translateMany(DESTINATIONS.map((d) => d.title), locale);
  const translatedDestinations = DESTINATIONS.map((d, i) => ({ ...d, title: titles[i] }));

  const [
    heading1,
    heading2,
    handpickedExperiences,
    intro,
    ctaTitle1,
    ctaTitle2,
    ctaText,
    ctaPackages,
    ctaContact,
    exploreLabel,
  ] = await translateMany(
    [
      "Explore",
      "Activities",
      "Handpicked Experiences",
      "From sacred cenotes and Mayan wonders to island escapes and pure relaxation — every experience is private, flexible and planned around you.",
      "Not sure where to",
      "start?",
      "Tell us your travel style and we'll build the perfect combination of activities for your trip.",
      "See Our Packages →",
      "Talk to Us →",
      "Explore",
    ],
    locale
  );

  return (
    <main className="bg-cream">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Activities", path: "/activities" },
          ]),
          itemListSchema(
            DESTINATIONS.map((d) => ({ name: d.title, url: `/destinations/${d.slug}` }))
          ),
        ]}
      />
      {/* Page header */}
      <section className="border-b border-sand bg-white/40">
        <div className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            {DESTINATIONS.length} {handpickedExperiences}
          </div>
          <h1 className="font-serif text-[clamp(36px,4.5vw,58px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            {heading1} <em className="italic text-forest">{heading2}</em>
          </h1>
          <p className="mt-4 max-w-[560px] text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.75] text-sage">
            {intro}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
          {translatedDestinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-[18px] transition-transform duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_18px_44px_rgba(28,43,30,0.18)]"
            >
              <Image
                src={d.card}
                alt={d.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,26,16,0.82) 0%, rgba(10,26,16,0.25) 45%, transparent 70%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-[clamp(14px,1.6vw,22px)]">
                <h2 className="font-serif text-[clamp(17px,1.7vw,23px)] font-semibold leading-[1.05] text-white">
                  {d.title}
                </h2>
                <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[2px] text-gold transition-all duration-300 group-hover:gap-2.5">
                  {exploreLabel} <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-[clamp(40px,5vw,64px)] rounded-[24px] bg-night px-6 py-[clamp(32px,4vw,52px)] text-center">
          <h2 className="font-serif text-[clamp(24px,2.6vw,36px)] font-semibold text-white">
            {ctaTitle1} <em className="italic text-gold">{ctaTitle2}</em>
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-[13.5px] leading-[1.7] text-white/60">
            {ctaText}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/packages"
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              {ctaPackages}
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-[1.5px] border-white/40 px-6 py-3 text-[14px] font-medium text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              {ctaContact}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

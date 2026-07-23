import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS } from "@/data/destinations";
import { getEffectiveDestination, getEffectiveDestinations } from "@/lib/content/activities";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { breadcrumbSchema, faqSchema, touristAttractionSchema } from "@/lib/seo";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";

type Props = { params: Promise<{ slug: string; locale: string }> };

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getEffectiveDestination(slug);
  if (!dest) return {};
  const title = `${dest.title} — Private Tour from Playa del Carmen`;
  const description = `${dest.title} in the Riviera Maya with Amanah Vacations: a private, family-safe${
    " and halal-friendly"
  } experience with hotel pickup and trusted guides. ${dest.paragraphs[0] ?? ""}`.slice(0, 158);
  return {
    title,
    description,
    keywords: [
      dest.title,
      `${dest.title} tour`,
      `${dest.title} Playa del Carmen`,
      `private ${dest.title} tour`,
      "Riviera Maya activities",
      "things to do Playa del Carmen",
    ],
    alternates: { canonical: `/destinations/${dest.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/destinations/${dest.slug}`,
      images: [dest.hero],
    },
  };
}

function faqsFor(title: string) {
  return [
    {
      q: `Is the ${title} experience private?`,
      a: `Yes. Every Amanah Vacations tour is fully private — it's just your group, never combined with other travelers — so you set the pace and enjoy ${title} on your own terms.`,
    },
    {
      q: `Is ${title} suitable for families and children?`,
      a: `Absolutely. We design ${title} to be family-safe and comfortable for all ages, with trusted local guides and private, air-conditioned transport included.`,
    },
    {
      q: `Do you offer halal-friendly options for ${title}?`,
      a: `Yes — we regularly host Muslim travelers and can arrange halal dining, prayer times and modest, private setups around your ${title} experience. Just let us know when you book.`,
    },
    {
      q: `How do I book ${title}?`,
      a: `Pick your dates and tell us your group size, then book online or message us on WhatsApp for a tailored quote. We confirm availability and hotel pickup within a few hours.`,
    },
  ];
}

export default async function DestinationPage({ params }: Props) {
  const { slug, locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const all = await getEffectiveDestinations();
  const dest = all.find((d) => d.slug === slug);
  if (!dest) notFound();

  const others = all.filter((d) => d.slug !== dest.slug).slice(0, 4);
  const idx = all.findIndex((d) => d.slug === dest.slug);
  const next = all[(idx + 1) % all.length];
  const faqsEn = faqsFor(dest.title);

  const allTitles = await translateMany(all.map((d) => d.title), locale);
  const titleByslug = new Map(all.map((d, i) => [d.slug, allTitles[i]]));
  const title = titleByslug.get(dest.slug)!;
  const nextTitle = titleByslug.get(next.slug)!;

  const paragraphs = await translateMany(dest.paragraphs, locale);

  const staticLabels = await translateMany(
    [
      "Description",
      "Amanah Vacations",
      "Private · Family Safe · Halal Friendly",
      "Contact Us to Book It",
      "Check Our Packages",
      "Next",
      "More",
      "experiences",
      "View All →",
      "Explore",
      "Good to know",
    ],
    locale
  );
  const [
    labelDescription,
    labelBrand,
    labelPrivateTags,
    labelContactBook,
    labelCheckPackages,
    labelNextWord,
    labelMore,
    labelExperiences,
    labelViewAll,
    labelExplore,
    faqEyebrow,
  ] = staticLabels;
  const labelNext = `${labelNextWord} · ${nextTitle}`;

  const faqTexts = await translateMany(
    [...faqsEn.map((f) => f.q), ...faqsEn.map((f) => f.a)],
    locale
  );
  const faqs = faqsEn.map((f, i) => ({ q: faqTexts[i], a: faqTexts[faqsEn.length + i] }));
  const [faqHeading] = await translateMany([`${title} — your questions answered`], locale);

  const othersTranslated = others.map((d) => ({ ...d, title: titleByslug.get(d.slug)! }));

  return (
    <main>
      <JsonLd
        data={[
          touristAttractionSchema({
            name: dest.title,
            description: dest.paragraphs[0] ?? dest.alt,
            image: dest.hero,
            url: `/destinations/${dest.slug}`,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Activities", path: "/activities" },
            { name: dest.title, path: `/destinations/${dest.slug}` },
          ]),
          faqSchema(faqs),
        ]}
      />
      {/* Full-page background image with floating cards — original design */}
      <section className="relative overflow-hidden">
        <Image
          src={dest.hero}
          alt={dest.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-night/15" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1320px] items-start gap-6 px-5 py-[clamp(28px,4vw,64px)] lg:grid-cols-[1.7fr_1fr] lg:gap-8 lg:px-8">
          {/* White content card */}
          <article className="overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(10,26,16,0.25)]">
            <div className="bg-cream/80 px-[clamp(22px,2.5vw,40px)] py-[clamp(18px,2vw,30px)]">
              <h1 className="font-serif text-[clamp(32px,4vw,54px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
                {title}
              </h1>
            </div>
            <div className="bg-white/55 px-[clamp(22px,2.5vw,40px)] py-[clamp(24px,2.5vw,36px)] backdrop-blur-[2px]">
              <div className="mb-4 flex items-center gap-2.5 border-b border-ink/15 pb-3 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
                {labelDescription}
              </div>
              <div className="space-y-4 text-[clamp(14px,1.05vw,15.5px)] leading-[1.85] text-ink/85">
                {paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </article>

          {/* Side booking card */}
          <aside className="overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(10,26,16,0.25)] lg:sticky lg:top-[108px]">
            {/* Barcode strip */}
            <div className="flex items-center justify-center bg-gradient-to-br from-gold to-terracotta px-6 py-7">
              <div
                aria-hidden
                className="h-14 w-44 opacity-90"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #1C2B1E 0 2px, transparent 2px 5px, #1C2B1E 5px 9px, transparent 9px 11px, #1C2B1E 11px 12px, transparent 12px 16px)",
                }}
              />
            </div>
            <div className="bg-cream/80 px-6 py-6">
              <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
                {labelBrand}
              </div>
              <p className="mb-5 font-serif text-[19px] font-semibold italic leading-snug text-ink">
                {labelPrivateTags}
              </p>
              <div className="space-y-2.5">
                <Link
                  href="/contact"
                  className="flex items-center justify-between rounded-full bg-ink px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-white transition hover:bg-forest"
                >
                  {labelContactBook}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/packages"
                  className="flex items-center justify-between rounded-full bg-gradient-to-br from-terracotta to-gold px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
                >
                  {labelCheckPackages}
                  <span aria-hidden>←</span>
                </Link>
              </div>
            </div>

            {/* Next activity */}
            <div className="flex justify-end bg-cream/80 px-6 pb-5">
              <Link
                href={`/destinations/${next.slug}`}
                className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1.5px] text-forest transition hover:text-terracotta"
              >
                {labelNext}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Faq items={faqs} heading={faqHeading} eyebrow={faqEyebrow} />

      {/* More activities */}
      <section className="bg-cream">
        <div className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-serif text-[clamp(24px,2.6vw,34px)] font-semibold text-ink">
              {labelMore} <em className="italic text-forest">{labelExperiences}</em>
            </h2>
            <Link
              href="/activities"
              className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
            >
              {labelViewAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
            {othersTranslated.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-[18px] transition-transform duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_18px_44px_rgba(28,43,30,0.18)]"
              >
                <Image
                  src={d.card}
                  alt={d.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
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
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-serif text-[clamp(16px,1.5vw,20px)] font-semibold leading-[1.05] text-white">
                    {d.title}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-gold">
                    {labelExplore} <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

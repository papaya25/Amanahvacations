import type { Metadata } from "next";
import VipClient from "./VipClient";
import { VIP_CONTENT_EN, type VipContent } from "./content";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import "./vip.css";

export const metadata: Metadata = {
  title: "VIP Experience — Luxury Without Limits",
  description:
    "A fully personalized VIP journey in the Riviera Maya: private transportation, dedicated guide, 24/7 concierge, yacht experiences, private chef, luxury villas and the region's finest resorts.",
};

/* Translate the whole VIP content object for a locale. Everything is flattened
   into one ordered array, translated in one batched call, then reassembled —
   so the client component receives a fully-localized VipContent. Place names
   (Rosewood, Palafitos, etc.) are preserved by the translation prompt. */
async function translateVipContent(locale: Locale): Promise<VipContent> {
  const c = VIP_CONTENT_EN;
  if (locale === "en") return c;

  const flat: string[] = [
    c.heroBadge, c.heroTitle1, c.heroTitleEm, c.heroSub,
    c.introTitle1, c.introTitleEm, c.introText, c.logoTagline,
    c.servicesEyebrow, c.servicesTitle1, c.servicesTitleEm,
    c.activitiesEyebrow, c.activitiesTitle1, c.activitiesTitleEm,
    c.browseBefore, c.browseLink, c.browseAfter,
    c.accomEyebrow, c.accomTitle1, c.accomTitleEm,
    c.includedLabel, c.includedQuote,
    c.ctaEyebrow, c.ctaHeadline1, c.ctaHeadlineEm, c.ctaPrimary, c.ctaSecondary,
    c.modalEyebrow, c.modalTitle, c.modalText, c.modalWhatsApp, c.modalEmail,
    c.mantra1, c.mantra2, c.mantra3,
    ...c.bodyParas,
    ...c.services.flatMap((s) => [s.title, s.desc]),
    ...c.activities.flatMap((a) => [a.title, a.desc]),
    ...c.accoms.flatMap((a) => [a.tag, a.name, a.desc, a.ideal]),
    ...c.includedList,
  ];

  const t = await translateMany(flat, locale);
  let i = 0;
  const next = () => t[i++];

  const scalars = {
    heroBadge: next(), heroTitle1: next(), heroTitleEm: next(), heroSub: next(),
    introTitle1: next(), introTitleEm: next(), introText: next(), logoTagline: next(),
    servicesEyebrow: next(), servicesTitle1: next(), servicesTitleEm: next(),
    activitiesEyebrow: next(), activitiesTitle1: next(), activitiesTitleEm: next(),
    browseBefore: next(), browseLink: next(), browseAfter: next(),
    accomEyebrow: next(), accomTitle1: next(), accomTitleEm: next(),
    includedLabel: next(), includedQuote: next(),
    ctaEyebrow: next(), ctaHeadline1: next(), ctaHeadlineEm: next(), ctaPrimary: next(), ctaSecondary: next(),
    modalEyebrow: next(), modalTitle: next(), modalText: next(), modalWhatsApp: next(), modalEmail: next(),
    mantra1: next(), mantra2: next(), mantra3: next(),
  };
  const bodyParas = c.bodyParas.map(() => next());
  const services = c.services.map(() => ({ title: next(), desc: next() }));
  const activities = c.activities.map(() => ({ title: next(), desc: next() }));
  const accoms = c.accoms.map(() => ({ tag: next(), name: next(), desc: next(), ideal: next() }));
  const includedList = c.includedList.map(() => next());

  return { ...scalars, bodyParas, services, activities, accoms, includedList };
}

export default async function VipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const content = await translateVipContent(locale);
  return (
    <main>
      <VipClient content={content} />
    </main>
  );
}

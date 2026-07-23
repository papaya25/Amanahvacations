import type { Metadata } from "next";
import HalalClient from "./HalalClient";
import { HALAL_CONTENT_EN, type HalalContent } from "./content";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import "./halal.css";

export const metadata: Metadata = {
  title: "Halal-Friendly Travel — Travel With Peace of Mind",
  description:
    "Halal travel in the Riviera Maya: halal-certified dining and private chefs, alcohol-free private villas, prayer and Qibla arrangements, modest beach setups, and family-first experiences.",
};

/* Flatten the whole Halal content object into one ordered array, translate it
   in a single batched call, then reassemble a fully-localized HalalContent. */
async function translateHalalContent(locale: Locale): Promise<HalalContent> {
  const c = HALAL_CONTENT_EN;
  if (locale === "en") return c;

  const flat: string[] = [
    c.heroBadge, c.heroTitle1, c.heroTitleEm, c.heroSub,
    c.introEyebrow, c.introTitle1, c.introTitleEm, c.introTitle2, c.introText,
    c.faithTagline,
    c.pillarsEyebrow, c.pillarsTitle1, c.pillarsTitleEm, c.pillarsNote,
    c.diningEyebrow, c.diningTitle1, c.diningTitleEm, c.diningNote,
    c.villaEyebrow, c.villaTitle1, c.villaTitleEm,
    c.villaContentEyebrow, c.villaContentTitle1, c.villaContentTitleEm, c.villaCorner, c.villaText,
    c.activitiesEyebrow, c.activitiesTitle1, c.activitiesTitleEm, c.activitiesNote,
    c.promiseLabel, c.promiseQuote,
    c.ctaEyebrow, c.ctaHeadline1, c.ctaHeadlineEm, c.ctaPrimary, c.ctaSecondary,
    c.modalEyebrow, c.modalTitle, c.modalText, c.modalWhatsApp, c.modalEmail,
    c.mantra1, c.mantra2, c.mantra3,
    ...c.promiseStrip,
    ...c.bodyParas,
    ...c.pillars.flatMap((p) => [p.title, p.desc]),
    ...c.perks.flatMap((p) => [p.title, p.desc]),
    ...c.activities.flatMap((a) => [a.title, a.desc]),
    ...c.dining.flatMap((d) => [d.tag, d.name1, d.nameEm, d.desc, ...d.features]),
    ...c.trust.flatMap((t) => [t.l1, t.l2]),
    ...c.promiseList,
  ];

  const t = await translateMany(flat, locale);
  let i = 0;
  const next = () => t[i++];

  const scalars = {
    heroBadge: next(), heroTitle1: next(), heroTitleEm: next(), heroSub: next(),
    introEyebrow: next(), introTitle1: next(), introTitleEm: next(), introTitle2: next(), introText: next(),
    faithTagline: next(),
    pillarsEyebrow: next(), pillarsTitle1: next(), pillarsTitleEm: next(), pillarsNote: next(),
    diningEyebrow: next(), diningTitle1: next(), diningTitleEm: next(), diningNote: next(),
    villaEyebrow: next(), villaTitle1: next(), villaTitleEm: next(),
    villaContentEyebrow: next(), villaContentTitle1: next(), villaContentTitleEm: next(), villaCorner: next(), villaText: next(),
    activitiesEyebrow: next(), activitiesTitle1: next(), activitiesTitleEm: next(), activitiesNote: next(),
    promiseLabel: next(), promiseQuote: next(),
    ctaEyebrow: next(), ctaHeadline1: next(), ctaHeadlineEm: next(), ctaPrimary: next(), ctaSecondary: next(),
    modalEyebrow: next(), modalTitle: next(), modalText: next(), modalWhatsApp: next(), modalEmail: next(),
    mantra1: next(), mantra2: next(), mantra3: next(),
  };
  const promiseStrip = c.promiseStrip.map(() => next());
  const bodyParas = c.bodyParas.map(() => next());
  const pillars = c.pillars.map(() => ({ title: next(), desc: next() }));
  const perks = c.perks.map(() => ({ title: next(), desc: next() }));
  const activities = c.activities.map(() => ({ title: next(), desc: next() }));
  const dining = c.dining.map((d) => ({
    tag: next(), name1: next(), nameEm: next(), desc: next(),
    features: d.features.map(() => next()),
  }));
  const trust = c.trust.map((tr) => ({ n: tr.n, l1: next(), l2: next() }));
  const promiseList = c.promiseList.map(() => next());

  return { ...scalars, promiseStrip, bodyParas, pillars, perks, activities, dining, trust, promiseList };
}

export default async function HalalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const content = await translateHalalContent(locale);
  return (
    <main>
      <HalalClient content={content} />
    </main>
  );
}

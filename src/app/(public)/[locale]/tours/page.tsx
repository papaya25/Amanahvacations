import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import ToursClient from "./ToursClient";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { breadcrumbSchema, faqSchema, itemListSchema, productOfferSchema } from "@/lib/seo";
import { getFaqs } from "@/lib/content/faq";
import { getSavedTours } from "@/lib/content/tours";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import "./tours.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Private Tours & Day Trips from Playa del Carmen | Riviera Maya",
  description:
    "Private guided tours from Playa del Carmen: Chichén Itzá, Tulum ruins, Cobá, cenotes, snorkeling with sea turtles in Akumal, Cozumel reefs, Holbox and Isla Contoy. Family-safe, halal-friendly, hotel pickup included.",
  keywords: [
    "private tours Playa del Carmen",
    "Riviera Maya tours",
    "Chichén Itzá tour",
    "Tulum tour",
    "Akumal snorkeling tour",
    "cenote tour Playa del Carmen",
    "Cozumel snorkeling",
    "things to do Riviera Maya",
  ],
  alternates: { canonical: "/tours" },
  openGraph: {
    type: "website",
    title: "Private Tours & Day Trips from Playa del Carmen",
    description:
      "Private guided day trips across the Riviera Maya & Yucatán — Chichén Itzá, Tulum, cenotes, Akumal turtles and more. Just for your group.",
    url: "/tours",
    images: ["/images/tours/chichen.jpg"],
  },
};

// Lightweight summary for structured data (prices in MXN).
const TOUR_SUMMARY = [
  { name: "Cenotes, Coral & Sea Turtles (Akumal)", price: 2350, img: "/images/tours/akumalcenotes.jpg" },
  { name: "Cenotes & the Ruins of Tulum", price: 3700, img: "/images/tours/tulumcenotes.jpg" },
  { name: "Coba Ruins & Jungle Cenotes", price: 3900, img: "/images/tours/cobacenotes.jpg" },
  { name: "Cozumel Private Boat Snorkeling", price: 4600, img: "/images/tours/cozumel.jpg" },
  { name: "Tulum & Akumal", price: 5850, img: "/images/tours/akumaltulum.jpg" },
  { name: "Chichen Itza & Valladolid", price: 6600, img: "/images/tours/chichen.jpg" },
  { name: "Ruta de Cenotes", price: 2900, img: "/images/tours/rutacenotes.jpg" },
];

const FAQS = [
  {
    q: "Are your tours private or shared?",
    a: "Every tour is 100% private — it's only your group, never combined with other travelers. You get a private guide and private, air-conditioned transport with hotel or villa pickup.",
  },
  {
    q: "Do you pick us up from our hotel in Playa del Carmen or Tulum?",
    a: "Yes. Private round-trip pickup from your hotel or villa in Playa del Carmen, Tulum and the surrounding Riviera Maya is included in every tour.",
  },
  {
    q: "Are the tours family-friendly and halal-friendly?",
    a: "Both. Our tours are designed to be comfortable for families and all ages, and we regularly host Muslim travelers — halal dining and prayer arrangements can be added on request.",
  },
  {
    q: "How far in advance should I book a tour?",
    a: "We ask for at least 24 hours' notice so we can arrange your private guide and transport. For popular dates and seasonal experiences like whale sharks, earlier is better.",
  },
  {
    q: "What's the difference between a tour and a package?",
    a: "A tour is a single private day trip. A package bundles several days of experiences (with optional accommodation) at a better combined price. See our Packages page to compare.",
  },
];

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const [faqs, dbTours] = await Promise.all([getFaqs("tours", FAQS), getSavedTours()]);

  // Structured data follows the live tour list once the admin has saved one.
  const summary = dbTours
    ? dbTours
        .filter((t) => !t.onreq && t.price > 0)
        .map((t) => ({ name: t.name, price: t.offer > 0 ? t.offer : t.price, img: t.img }))
    : TOUR_SUMMARY;

  const translatedTours = dbTours
    ? await Promise.all(
        dbTours.map(async (t) => {
          const stopTexts = await translateMany(
            [t.name, t.sub, t.dur, ...t.stops.map((s) => s.place), ...t.stops.map((s) => s.desc)],
            locale
          );
          const n = t.stops.length;
          return {
            ...t,
            name: stopTexts[0],
            sub: stopTexts[1],
            dur: stopTexts[2],
            stops: t.stops.map((s, i) => ({ ...s, place: stopTexts[3 + i], desc: stopTexts[3 + n + i] })),
          };
        })
      )
    : dbTours;

  const faqTexts = await translateMany(
    [...faqs.map((f) => f.q), ...faqs.map((f) => f.a)],
    locale
  );
  const translatedFaqs = faqs.map((f, i) => ({
    q: faqTexts[i],
    a: faqTexts[faqs.length + i],
  }));
  const [faqHeading, faqEyebrow] = await translateMany(
    ["Tours — frequently asked questions", "Good to know"],
    locale
  );

  return (
    <main className={caveat.variable}>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tours", path: "/tours" },
          ]),
          itemListSchema(summary.map((t) => ({ name: t.name, url: "/tours" }))),
          ...summary.map((t) =>
            productOfferSchema({
              name: t.name,
              description: `${t.name} — a private guided tour from Playa del Carmen with Amanah Vacations.`,
              image: t.img,
              url: "/tours",
              priceMXN: t.price,
            })
          ),
          faqSchema(faqs),
        ]}
      />
      <ToursClient dbTours={translatedTours ?? undefined} />
      <Faq items={translatedFaqs} heading={faqHeading} eyebrow={faqEyebrow} />
    </main>
  );
}

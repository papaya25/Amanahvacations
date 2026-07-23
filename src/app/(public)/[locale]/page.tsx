import Hero from "@/components/Hero";
import PostcardDivider from "@/components/PostcardDivider";
import TripPicker from "@/components/TripPicker";
import Activities from "@/components/Activities";
import HowItWorks from "@/components/HowItWorks";
import DreamAdventure from "@/components/DreamAdventure";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/seo";
import { getHero } from "@/lib/content/hero";
import { getFaqs } from "@/lib/content/faq";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";

const FAQS = [
  {
    q: "What is the best way to explore the Riviera Maya?",
    a: "With a private, curated trip. Rather than crowded group buses, Amanah Vacations arranges private tours and activities — cenotes, Mayan ruins, beaches and islands — with trusted guides, hotel pickup, and an itinerary built around you.",
  },
  {
    q: "Where are you based and where do you operate?",
    a: "We're based in Playa del Carmen and operate across the whole Riviera Maya and Yucatán — Playa del Carmen, Tulum, Cancún, Akumal, Cobá, Chichén Itzá, Holbox, Cozumel and more.",
  },
  {
    q: "Are your trips family-safe and halal-friendly?",
    a: "Yes to both. Everything is designed to be comfortable for families and couples, and we specialize in halal-friendly travel — halal dining, alcohol-free private villas, prayer arrangements and modest setups on request.",
  },
  {
    q: "What languages does your team speak?",
    a: "Our multilingual team assists travelers in English, French, Spanish and Arabic, so you feel at home from your first message to your last day.",
  },
  {
    q: "How do I book?",
    a: "Browse our activities, tours and packages, pick your dates and group size, then book online or message us on WhatsApp for a tailored quote. We confirm within a few hours.",
  },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [hero, faqs] = await Promise.all([getHero(), getFaqs("home", FAQS)]);

  const heroTexts = await translateMany(
    [
      hero.headline,
      hero.headlineEm,
      hero.tagline,
      hero.dreamTitle,
      hero.dreamText,
      ...hero.slides.map((s) => s.name),
      ...hero.slides.map((s) => s.sub),
    ],
    locale
  );
  const n = hero.slides.length;
  const translatedHero = {
    ...hero,
    headline: heroTexts[0],
    headlineEm: heroTexts[1],
    tagline: heroTexts[2],
    dreamTitle: heroTexts[3],
    dreamText: heroTexts[4],
    slides: hero.slides.map((s, i) => ({
      ...s,
      name: heroTexts[5 + i],
      sub: heroTexts[5 + n + i],
    })),
  };

  const faqTexts = await translateMany(
    [...faqs.map((f) => f.q), ...faqs.map((f) => f.a)],
    locale
  );
  const translatedFaqs = faqs.map((f, i) => ({
    q: faqTexts[i],
    a: faqTexts[faqs.length + i],
  }));

  const headingTexts = await translateMany(
    ["Planning your Riviera Maya trip", "Questions & answers"],
    locale
  );

  return (
    <main>
      <JsonLd data={faqSchema(faqs)} />
      <Hero content={translatedHero} />
      <PostcardDivider />
      <TripPicker />
      <Activities />
      <HowItWorks />
      <DreamAdventure title={translatedHero.dreamTitle} text={translatedHero.dreamText} />
      <Faq items={translatedFaqs} heading={headingTexts[0]} eyebrow={headingTexts[1]} dark />
    </main>
  );
}

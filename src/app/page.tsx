import Hero from "@/components/Hero";
import PostcardDivider from "@/components/PostcardDivider";
import TripPicker from "@/components/TripPicker";
import Activities from "@/components/Activities";
import HowItWorks from "@/components/HowItWorks";
import DreamAdventure from "@/components/DreamAdventure";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/seo";

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

export default function Home() {
  return (
    <main>
      <JsonLd data={faqSchema(FAQS)} />
      <Hero />
      <PostcardDivider />
      <TripPicker />
      <Activities />
      <HowItWorks />
      <DreamAdventure />
      <Faq items={FAQS} heading="Planning your Riviera Maya trip" eyebrow="Questions & answers" dark />
    </main>
  );
}

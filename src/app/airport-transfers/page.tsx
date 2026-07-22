import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cancún Airport Transfers — Private to Playa del Carmen & Tulum",
  description:
    "Private airport transfers from Cancún International Airport to Playa del Carmen, Tulum and the Riviera Maya. Meet & greet, air-conditioned private vans, flight tracking, child seats — just your group, never shared.",
  keywords: [
    "Cancun airport transfer",
    "Cancun airport to Playa del Carmen",
    "Cancun airport to Tulum",
    "private airport transfer Riviera Maya",
    "airport shuttle Playa del Carmen",
  ],
  alternates: { canonical: "/airport-transfers" },
  openGraph: {
    type: "website",
    title: "Private Cancún Airport Transfers | Amanah Vacations",
    description:
      "Land relaxed. Private, air-conditioned transfers from Cancún airport to anywhere in the Riviera Maya — meet & greet included.",
    url: "/airport-transfers",
    images: ["/images/hero-beaches.jpg"],
  },
};

const FEATURES = [
  { title: "Meet & Greet at Arrivals", desc: "Your driver waits for you inside the terminal with a sign — no hunting for taxis, no negotiating." },
  { title: "Private, Air-Conditioned Vans", desc: "Just your group and your luggage. Cold water on board and room to stretch out after the flight." },
  { title: "Flight Tracking", desc: "We monitor your flight — if you're delayed, your driver adjusts. No stress, no extra charge." },
  { title: "Child Seats on Request", desc: "Traveling with little ones? Tell us the ages and we'll have the right seats installed." },
  { title: "Any Destination in the Riviera Maya", desc: "Playa del Carmen, Tulum, Akumal, Puerto Aventuras, hotels or private villas — door to door." },
  { title: "Round Trip or One Way", desc: "Book your arrival, your departure, or both — we'll schedule the return pickup around your flight." },
];

const FAQS = [
  {
    q: "How much does a private transfer from Cancún airport cost?",
    a: "Pricing depends on your destination and group size — message us with your flight details and group and we'll confirm an exact quote right away. Transfers are also included in all our packages.",
  },
  {
    q: "How long is the drive from Cancún airport to Playa del Carmen or Tulum?",
    a: "Around 45–60 minutes to Playa del Carmen and about 1 hour 45 minutes to Tulum, depending on traffic and your exact hotel or villa.",
  },
  {
    q: "What happens if my flight is delayed?",
    a: "Nothing changes for you — we track your flight and your driver adjusts to the actual arrival time at no extra cost.",
  },
  {
    q: "Is the transfer really private?",
    a: "Yes. Like everything at Amanah Vacations, your transfer is only for your group — no shared shuttles, no waiting for other passengers, no extra stops.",
  },
];

export default function AirportTransfersPage() {
  return (
    <main className="bg-cream">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Airport Transfers", path: "/airport-transfers" },
          ]),
          faqSchema(FAQS),
        ]}
      />

      {/* Hero */}
      <section className="relative flex min-h-[44vh] items-end overflow-hidden md:min-h-[52vh]">
        <Image
          src="/images/hero-beaches.jpg"
          alt="Arriving relaxed to the white-sand beaches of the Riviera Maya"
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
              "linear-gradient(to top, rgba(10,26,16,0.85) 0%, rgba(10,26,16,0.3) 55%, rgba(10,26,16,0.1) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-[clamp(28px,4vw,52px)] pt-24 lg:px-8">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-gold" />
            Door to Door · Just Your Group
          </div>
          <h1 className="max-w-[760px] font-serif text-[clamp(34px,4.6vw,58px)] font-semibold leading-[1.02] tracking-[-1px] text-white">
            Private Cancún airport transfers,{" "}
            <em className="italic text-gold">done right</em>
          </h1>
        </div>
      </section>

      {/* Intro + features */}
      <section className="mx-auto max-w-[1320px] px-5 py-[clamp(44px,5.5vw,80px)] lg:px-8">
        <p className="max-w-[680px] text-[clamp(14px,1.1vw,16px)] leading-[1.85] text-ink/80">
          Your vacation starts the moment you land — not after a chaotic taxi line. We collect you
          inside the terminal and drive you straight to your hotel or villa in Playa del Carmen,
          Tulum, or anywhere in the Riviera Maya, in a private air-conditioned van with cold water
          waiting. Every transfer is exclusively for your group.
        </p>

        <div className="mt-[clamp(28px,3.5vw,48px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-[18px] border border-sand bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_16px_40px_rgba(28,43,30,0.10)]"
            >
              <div className="mb-3 font-serif text-[26px] font-semibold italic leading-none text-gold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h2 className="mb-2 font-serif text-[19px] font-semibold leading-tight text-ink">{f.title}</h2>
              <p className="text-[13px] leading-[1.7] text-sage">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing / CTA band */}
        <div className="mt-[clamp(32px,4vw,56px)] rounded-[24px] bg-night px-6 py-[clamp(32px,4vw,52px)] text-center">
          <h2 className="font-serif text-[clamp(24px,2.6vw,36px)] font-semibold text-white">
            Simple pricing, <em className="italic text-gold">per person or per group</em>
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[13.5px] leading-[1.75] text-white/60">
            Rates depend on your destination and group size. Send us your flight details and
            we&apos;ll confirm your exact price right away — or add a transfer to any booking at
            checkout. Transfers are already included in all our packages.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://wa.me/529844521184?text=Hello%20Amanah%20Vacations!%20I'd%20like%20a%20quote%20for%20a%20private%20airport%20transfer."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              Get a Quote on WhatsApp →
            </a>
            <Link
              href="/contact"
              className="rounded-full border-[1.5px] border-white/40 px-6 py-3 text-[14px] font-medium text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Faq items={FAQS} heading="Airport transfers — good to know" />
    </main>
  );
}

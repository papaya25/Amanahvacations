import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Book Your Vacation",
  description:
    "Contact Amanah Vacations to book your Riviera Maya trip — reach us by WhatsApp, email or the contact form. Based in Playa del Carmen, replying same-day in English, French, Spanish and Arabic.",
};

const CARDS = [
  {
    title: "WhatsApp",
    value: "+52 984 452 1184",
    note: "Fastest way to reach us",
    href: "https://wa.me/529844521184",
  },
  {
    title: "Email",
    value: "booking@amanahvacations.com",
    note: "For quotes & detailed requests",
    href: "mailto:booking@amanahvacations.com",
  },
  {
    title: "Based in",
    value: "Playa del Carmen",
    note: "Riviera Maya · Quintana Roo · Mexico",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-cream">
      <section className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
        <div className="mb-[clamp(28px,3.5vw,48px)] max-w-[640px]">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            We Speak EN · FR · ES · AR
          </div>
          <h1 className="font-serif text-[clamp(34px,4.5vw,56px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            Contact us to book <em className="italic text-forest">your vacation</em>
          </h1>
          <p className="mt-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.75] text-sage">
            Tell us what you&apos;re dreaming of — we&apos;ll design it around you. Message us
            directly on WhatsApp, send an email, or use the form below.
          </p>
        </div>

        <div className="grid gap-[clamp(24px,3vw,48px)] lg:grid-cols-[1fr_1.5fr]">
          {/* Direct contact cards */}
          <div className="flex flex-col gap-4">
            {CARDS.map((c) => {
              const inner = (
                <>
                  <div className="text-[11px] font-semibold uppercase tracking-[2.5px] text-terracotta">
                    {c.title}
                  </div>
                  <div className="mt-1.5 break-words font-serif text-[clamp(19px,1.8vw,24px)] font-semibold text-ink">
                    {c.value}
                  </div>
                  <div className="mt-1 text-[12.5px] text-sage">{c.note}</div>
                </>
              );
              return c.href ? (
                <a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="rounded-[20px] border border-sand bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_16px_40px_rgba(28,43,30,0.10)]"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.title} className="rounded-[20px] border border-sand bg-white p-6">
                  {inner}
                </div>
              );
            })}
            <div className="rounded-[20px] bg-night p-6 text-center">
              <p className="font-serif text-[17px] italic leading-relaxed text-white/85">
                &ldquo;Trust in Adventure.&rdquo;
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[2.5px] text-gold">
                Same-day replies · 7 days a week
              </p>
            </div>
          </div>

          {/* Form */}
          <ContactClient />
        </div>
      </section>
    </main>
  );
}

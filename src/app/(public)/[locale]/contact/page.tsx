import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { DEFAULT_CONTACT_LABELS } from "./labels";
import { translateMany, translateDict } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";

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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const texts = await translateMany(
    [
      "We Speak EN · FR · ES · AR",
      "Contact us to book",
      "your vacation",
      "Tell us what you're dreaming of — we'll design it around you. Message us directly on WhatsApp, send an email, or use the form below.",
      "Trust in Adventure.",
      "Same-day replies · 7 days a week",
      ...CARDS.map((c) => c.title),
      ...CARDS.map((c) => c.note),
    ],
    locale
  );
  const [labelSpeak, labelContactUs, labelVacation, labelIntro, labelQuote, labelReplies] = texts;
  const translatedCards = CARDS.map((c, i) => ({
    ...c,
    title: texts[6 + i],
    note: texts[6 + CARDS.length + i],
  }));
  const contactLabels = await translateDict(DEFAULT_CONTACT_LABELS, locale);

  return (
    <main className="bg-cream">
      <section className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
        <div className="mb-[clamp(28px,3.5vw,48px)] max-w-[640px]">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            {labelSpeak}
          </div>
          <h1 className="font-serif text-[clamp(34px,4.5vw,56px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            {labelContactUs} <em className="italic text-forest">{labelVacation}</em>
          </h1>
          <p className="mt-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.75] text-sage">
            {labelIntro}
          </p>
        </div>

        <div className="grid gap-[clamp(24px,3vw,48px)] lg:grid-cols-[1fr_1.5fr]">
          {/* Direct contact cards */}
          <div className="flex flex-col gap-4">
            {translatedCards.map((c) => {
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
                &ldquo;{labelQuote}&rdquo;
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[2.5px] text-gold">
                {labelReplies}
              </p>
            </div>
          </div>

          {/* Form */}
          <ContactClient labels={contactLabels} />
        </div>
      </section>
    </main>
  );
}

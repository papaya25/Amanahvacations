import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAbout } from "@/lib/content/about";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "About Us — The Amanah Difference",
  description:
    "Amanah Vacations designs complete, personalized experiences in the Riviera Maya — private tours, luxury options and halal-friendly travel, with a multilingual team welcoming guests from all over the world.",
};

const VALUES = [
  { title: "Multilingual Team", desc: "English, Français, Español & العربية — we welcome travelers from every corner of the world." },
  { title: "Every Detail Handled", desc: "From first contact to your final day, everything is seamless, organized and tailored." },
  { title: "Private & Luxury", desc: "High-end, private and discreet experiences for those who value comfort and exclusivity." },
  { title: "Halal-Friendly", desc: "Carefully selected stays and activities that respect Muslim travelers' values and lifestyle." },
];

const DEFAULT_INTRO_1 =
  "The Riviera Maya is more than just a destination — it's a place where nature, culture, and unforgettable experiences come together in a way few places in the world can offer. From the turquoise waters of the Caribbean and white-sand beaches to ancient Mayan cities like Tulum Ruins and Chichén Itzá, every day here holds the potential for something extraordinary. Add to that the magic of cenotes, vibrant marine life, jungle adventures, and nearby islands, and you have a destination that offers both relaxation and excitement at every turn.";
const DEFAULT_INTRO_2 =
  "At Amanah Vacations, we go beyond simply offering activities — we design complete experiences. With deep local knowledge and a strong focus on quality, comfort, and personalization, we take care of every detail so you can fully enjoy your journey. From seamless organization and trusted guides to exclusive options and tailored services, our goal is simple: to turn your stay in the Riviera Maya into a truly unforgettable experience.";
const DEFAULT_QUOTE =
  "We don't believe in one-size-fits-all travel. Every journey is different — and that's exactly how we design it. For you.";
const DEFAULT_STORY_1 =
  "Our journey began with a simple idea: to share the beauty and diversity of the Riviera Maya with the world. Inspired by its breathtaking landscapes, rich culture, and endless possibilities, we set out to create more than just trips — we create meaningful, unforgettable experiences.";
const DEFAULT_STORY_2 =
  "We quickly realized that tourism in the region is largely focused on travelers from North America, Latin America, and parts of Europe. Our vision is to open this incredible destination to a wider audience — welcoming guests from North Africa, the Middle East, and South & East Asia. With a multilingual team and diverse cultural backgrounds, we understand, connect with, and take care of travelers from all over the world in a way that feels natural, comfortable, and personalized.";
const DEFAULT_STORY_3 =
  "Whether it's a romantic honeymoon, a surprise marriage proposal, a family vacation, or a group getaway, we design each experience with attention to detail and a deep understanding of what makes a trip truly special — including high-end private and luxury experiences, and tailored trips for Muslim travelers who wish to explore Mexico while staying aligned with their values.";
const DEFAULT_CLOSING_TEXT =
  "The Riviera Maya offers experiences found nowhere else in the world — magical cenotes, iconic sites like Tulum and Chichén Itzá, and moments that are different, authentic, and deeply immersive. Those adventures become memories that stay with you long after your journey ends. No matter where you come from, once you've experienced the Riviera Maya, a part of Mexico will always live within you.";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  // null until the admin saves the About section; the page then uses their copy.
  const about = await getAbout();
  const paras = (s: string) => s.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const values = about?.values?.length ? about.values : VALUES;

  const introParas = about ? paras(about.intro) : [DEFAULT_INTRO_1, DEFAULT_INTRO_2];
  const storyParas = about ? paras(about.story) : [DEFAULT_STORY_1, DEFAULT_STORY_2, DEFAULT_STORY_3];

  const texts = await translateMany(
    [
      about?.headline || "We know where to find real adventure",
      ...introParas,
      about?.quote || DEFAULT_QUOTE,
      ...storyParas,
      about?.closingTitle || "Turning unforgettable moments into your ultimate adventure",
      about?.closingText || DEFAULT_CLOSING_TEXT,
      "Unique Journeys Await",
      "Who We Are",
      "The Amanah Difference",
      "More Than a Trip",
      "Plan Your Trip →",
      ...values.map((v) => v.title),
      ...values.map((v) => v.desc),
    ],
    locale
  );

  let cursor = 0;
  const take = (n: number) => texts.slice(cursor, (cursor += n));
  const headline = take(1)[0];
  const introParasT = take(introParas.length);
  const quote = take(1)[0];
  const storyParasT = take(storyParas.length);
  const closingTitle = take(1)[0];
  const closingText = take(1)[0];
  const labelJourneys = take(1)[0];
  const labelWhoWeAre = take(1)[0];
  const labelDifference = take(1)[0];
  const labelMoreThanTrip = take(1)[0];
  const labelPlanTrip = take(1)[0];
  const valueTitles = take(values.length);
  const valueDescs = take(values.length);
  const translatedValues = values.map((v, i) => ({ title: valueTitles[i], desc: valueDescs[i] }));

  return (
    <main className="bg-cream">
      {/* Hero */}
      <section className="relative flex min-h-[46vh] items-end overflow-hidden md:min-h-[56vh]">
        <Image
          src="/images/hero-tulum.jpg"
          alt="The Mayan ruins of Tulum above the Caribbean Sea"
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
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-[clamp(28px,4vw,56px)] pt-24 lg:px-8">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-gold" />
            {labelJourneys}
          </div>
          <h1 className="max-w-[760px] font-serif text-[clamp(36px,5vw,64px)] font-semibold leading-[1.0] tracking-[-1px] text-white">
            {headline}
          </h1>
        </div>
      </section>

      {/* Real adventure — text + photos */}
      <section className="mx-auto grid max-w-[1320px] items-center gap-[clamp(32px,4vw,72px)] px-5 py-[clamp(48px,6vw,88px)] md:grid-cols-2 lg:px-8">
        <div>
          <div className="space-y-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.85] text-ink/80">
            {introParasT.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
            <Image src="/images/hero-cenotes.jpg" alt="A hidden cenote with a beam of sunlight" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-[18px]">
            <Image src="/images/dest/holbox.jpg" alt="Holbox island beach" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative -mt-8 aspect-[3/4] overflow-hidden rounded-[18px]">
            <Image src="/images/dest/siankaan.jpg" alt="Sian Ka'an biosphere reserve" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
            <Image src="/images/hero-dining.jpg" alt="Private sunset dinner on the beach" fill sizes="25vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="bg-white py-[clamp(48px,6vw,88px)]">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="mx-auto mb-[clamp(28px,3.5vw,48px)] max-w-[720px] text-center">
            <div className="mb-3 flex items-center justify-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
              <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
              {labelWhoWeAre}
              <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            </div>
            <h2 className="font-serif text-[clamp(30px,3.4vw,46px)] font-semibold leading-[1.05] tracking-[-1px] text-ink">
              {labelDifference}
            </h2>
          </div>

          <div className="mx-auto grid max-w-[1100px] gap-[clamp(28px,3.5vw,64px)] lg:grid-cols-[1fr_1.4fr]">
            <blockquote className="h-fit rounded-[20px] bg-cream p-[clamp(22px,2.5vw,34px)] font-serif text-[clamp(19px,1.8vw,25px)] font-medium italic leading-[1.45] text-forest lg:sticky lg:top-[108px]">
              &ldquo;{quote}&rdquo;
              <span className="mt-4 block text-[11px] font-sans font-semibold not-italic uppercase tracking-[2.5px] text-terracotta">
                Amanah · أمانة · Trust
              </span>
            </blockquote>
            <div className="space-y-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.85] text-ink/80">
              {storyParasT.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>

          {/* Value cards */}
          <div className="mx-auto mt-[clamp(32px,4vw,56px)] grid max-w-[1100px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {translatedValues.map((v, i) => (
              <div
                key={v.title}
                className="rounded-[18px] border border-sand bg-cream p-6 transition duration-300 hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_16px_40px_rgba(28,43,30,0.10)]"
              >
                <div className="mb-3 font-serif text-[28px] font-semibold italic leading-none text-gold">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-2 font-serif text-[19px] font-semibold leading-tight text-ink">
                  {v.title}
                </h3>
                <p className="text-[13px] leading-[1.7] text-sage">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section className="relative overflow-hidden bg-night py-[clamp(56px,7vw,104px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full opacity-[0.13]"
          style={{ background: "radial-gradient(circle, #E8A84B, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 left-4 select-none whitespace-nowrap font-serif text-[clamp(100px,13vw,180px)] leading-none text-white/[0.03]"
        >
          أمانة
        </div>
        <div className="relative mx-auto max-w-[820px] px-5 text-center lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-3 text-[10.5px] font-semibold uppercase tracking-[3.5px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[30px] bg-gold/60" />
            {labelMoreThanTrip}
            <span aria-hidden className="h-[1.5px] w-[30px] bg-gold/60" />
          </div>
          <h2 className="font-serif text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.1] tracking-[-1px] text-white">
            {closingTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[640px] text-[clamp(13px,1vw,15px)] leading-[1.85] text-white/60">
            {closingText}
          </p>
          <div className="mt-8">
            <Link
              href="/packages"
              className="inline-block rounded-full bg-gradient-to-br from-terracotta to-gold px-8 py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              {labelPlanTrip}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

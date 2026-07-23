import { translateMany } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

const STEPS = [
  {
    n: "01",
    title: "Tell us your travel style",
    desc: "Family, water, culture, romance or VIP — share your dates, your group and the pace you love. It takes two minutes.",
  },
  {
    n: "02",
    title: "Get a tailor-made plan",
    desc: "A day-by-day itinerary crafted around you: private transport, trusted guides and transparent prices. No hidden fees.",
  },
  {
    n: "03",
    title: "Book securely online",
    desc: "Confirm with a secure payment and receive instant confirmation — every detail of your trip in one place.",
  },
  {
    n: "04",
    title: "Travel with trust",
    desc: "Your private guide takes care of everything on the ground — family-safe, halal-friendly on request — while you live it.",
  },
];

export default async function HowItWorks({ locale }: { locale: Locale }) {
  const texts = await translateMany(
    [
      "The Amanah Way",
      "From dream to",
      "departure",
      "Amanah means",
      "trust",
      "in Arabic — and trust is how we plan every trip. Four steps, zero stress.",
      ...STEPS.map((s) => s.title),
      ...STEPS.map((s) => s.desc),
    ],
    locale
  );
  const n = STEPS.length;
  const [
    labelAmanahWay,
    fromDreamTo,
    departure,
    amanahMeans,
    trustWord,
    trustSuffix,
  ] = texts;
  const steps = STEPS.map((s, i) => ({ ...s, title: texts[6 + i], desc: texts[6 + n + i] }));
  return (
    <section
      className="relative overflow-hidden bg-night py-[clamp(64px,8vw,120px)]"
      aria-labelledby="how-heading"
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full opacity-[0.14]"
        style={{ background: "radial-gradient(circle, #E8A84B, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 bottom-0 h-[520px] w-[520px] rounded-full opacity-[0.1]"
        style={{ background: "radial-gradient(circle, #3A8A5E, transparent 65%)" }}
      />
      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-4 select-none whitespace-nowrap font-serif text-[clamp(110px,14vw,190px)] leading-none text-white/[0.03]"
      >
        أمانة
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="mb-[clamp(40px,5vw,72px)] text-center">
          <div className="mb-4 flex items-center justify-center gap-3 text-[10.5px] font-semibold uppercase tracking-[3.5px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[30px] bg-gold/60" />
            {labelAmanahWay}
            <span aria-hidden className="h-[1.5px] w-[30px] bg-gold/60" />
          </div>
          <h2
            id="how-heading"
            className="font-serif text-[clamp(34px,4vw,54px)] font-semibold leading-[1.02] tracking-[-1px] text-white"
          >
            {fromDreamTo} <em className="italic text-gold">{departure}</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[clamp(13px,1vw,15px)] leading-[1.75] text-white/55">
            {amanahMeans} <em className="italic text-white/75">{trustWord}</em> {trustSuffix}
          </p>
        </div>

        {/* Journey line (desktop) */}
        <div className="relative">
          <svg
            aria-hidden
            className="absolute left-0 right-0 top-[54px] hidden w-full lg:block"
            height="2"
            preserveAspectRatio="none"
          >
            <line
              x1="6%"
              y1="1"
              x2="94%"
              y2="1"
              stroke="#E8A84B"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              strokeDasharray="2 7"
            />
          </svg>

          <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="group relative text-center lg:px-2">
                {/* Numeral medallion */}
                <div className="relative z-10 mx-auto mb-6 flex h-[108px] w-[108px] items-center justify-center rounded-full border border-gold/30 bg-night transition-all duration-500 group-hover:border-gold group-hover:shadow-[0_0_44px_rgba(232,168,75,0.25)]">
                  <div
                    aria-hidden
                    className="absolute inset-[7px] rounded-full border border-white/8"
                  />
                  <span className="font-serif text-[40px] font-semibold italic leading-none text-gold transition-transform duration-500 group-hover:scale-110">
                    {s.n}
                  </span>
                </div>
                <h3 className="mb-2.5 font-serif text-[clamp(20px,1.7vw,24px)] font-semibold leading-tight text-white">
                  {s.title}
                </h3>
                <p className="mx-auto max-w-[280px] text-[13px] leading-[1.75] text-white/55">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

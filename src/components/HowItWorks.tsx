const STEPS = [
  {
    n: "01",
    icon: "🧭",
    title: "Tell us your travel style",
    desc: "Pick a vibe — family, water, culture, romance or VIP — and share your dates and group size. It takes two minutes.",
  },
  {
    n: "02",
    icon: "✍️",
    title: "Get a tailor-made plan",
    desc: "We craft a day-by-day itinerary around you: private transport, trusted guides and transparent prices. No hidden fees.",
  },
  {
    n: "03",
    icon: "🔐",
    title: "Book securely online",
    desc: "Confirm your trip with a secure online payment and receive instant confirmation with everything in one place.",
  },
  {
    n: "04",
    icon: "🌴",
    title: "Travel with trust",
    desc: "Your private guide handles every detail on the ground — family-safe, halal-friendly on request — so you just enjoy.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-[clamp(56px,7vw,96px)]" aria-labelledby="how-heading">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="mb-[clamp(32px,4vw,56px)] text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            Simple &amp; Transparent
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
          </div>
          <h2
            id="how-heading"
            className="font-serif text-[clamp(32px,3.6vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink"
          >
            How it <em className="italic text-forest">works</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[clamp(13px,1vw,15px)] leading-[1.75] text-sage">
            Amanah means <em className="italic">trust</em> in Arabic — and that
            is exactly how we plan your trip. Four steps, zero stress.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="group relative rounded-[20px] border border-sand bg-cream p-[clamp(20px,2vw,28px)] transition duration-300 hover:-translate-y-1 hover:border-forest/40 hover:shadow-[0_18px_44px_rgba(28,43,30,0.10)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute right-4 top-3 select-none font-serif text-[56px] font-semibold leading-none text-forest/8"
              >
                {s.n}
              </div>
              <div
                aria-hidden
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[22px] shadow-[0_2px_10px_rgba(28,43,30,0.06)]"
              >
                {s.icon}
              </div>
              <h3 className="mb-2 font-serif text-[clamp(19px,1.6vw,22px)] font-semibold leading-tight text-ink">
                {s.title}
              </h3>
              <p className="text-[13px] leading-[1.7] text-sage">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -right-[14px] top-1/2 z-10 hidden -translate-y-1/2 text-gold lg:block"
                >
                  →
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

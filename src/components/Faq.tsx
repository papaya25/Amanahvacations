"use client";

import { useState } from "react";

/* Accordion FAQ. The FAQPage JSON-LD is emitted by the page (server side) via
   faqSchema() so Google can show the questions as rich results — this component
   is just the visible, interactive UI. */
export default function Faq({
  heading = "Frequently asked questions",
  eyebrow = "Good to know",
  items,
  dark = false,
}: {
  heading?: string;
  eyebrow?: string;
  items: { q: string; a: string }[];
  dark?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className={dark ? "bg-night" : "bg-white"}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[820px] px-5 py-[clamp(48px,6vw,88px)] lg:px-8">
        <div className="mb-8 text-center">
          <div
            className={`mb-3 flex items-center justify-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] ${
              dark ? "text-gold" : "text-terracotta"
            }`}
          >
            <span aria-hidden className={`h-[1.5px] w-[26px] ${dark ? "bg-gold/60" : "bg-terracotta"}`} />
            {eyebrow}
          </div>
          <h2
            id="faq-heading"
            className={`font-serif text-[clamp(26px,3.2vw,40px)] font-semibold leading-[1.05] tracking-[-0.5px] ${
              dark ? "text-white" : "text-ink"
            }`}
          >
            {heading}
          </h2>
        </div>

        <div className="space-y-2.5">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div
                key={it.q}
                className={`overflow-hidden rounded-[14px] border ${
                  dark ? "border-white/12 bg-white/[0.03]" : "border-sand bg-cream/40"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={`font-serif text-[clamp(16px,1.5vw,19px)] font-semibold ${
                      dark ? "text-white" : "text-ink"
                    }`}
                  >
                    {it.q}
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 text-[20px] leading-none transition-transform ${
                      isOpen ? "rotate-45" : ""
                    } ${dark ? "text-gold" : "text-terracotta"}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`px-5 pb-4 text-[14px] leading-[1.75] ${
                        dark ? "text-white/65" : "text-sage"
                      }`}
                    >
                      {it.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

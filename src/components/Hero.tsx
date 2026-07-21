"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    src: "/images/hero-cenotes.jpg",
    name: "Hidden Cenotes",
    sub: "Sacred underground rivers",
    alt: "Sunbeam falling into a hidden cenote with turquoise water in the Riviera Maya",
  },
  {
    src: "/images/hero-tulum.jpg",
    name: "Tulum Ruins",
    sub: "Ancient Mayan civilisation",
    alt: "Ancient Mayan ruins of Tulum overlooking the Caribbean Sea",
  },
  {
    src: "/images/hero-dining.jpg",
    name: "Sunset Dining",
    sub: "Private beachside experience",
    alt: "Private sunset dinner set up on a Caribbean beach",
  },
  {
    src: "/images/hero-jungle.jpg",
    name: "Jungle Adventure",
    sub: "Zip-lines & Mayan ruins",
    alt: "Traveler riding a zip-line above the jungle canopy near Mayan ruins",
  },
  {
    src: "/images/hero-villas.jpg",
    name: "Luxury Villas",
    sub: "Infinity pools & Caribbean views",
    alt: "Luxury villa infinity pool with Caribbean sea views",
  },
  {
    src: "/images/hero-beaches.jpg",
    name: "Private Beaches",
    sub: "Exclusive cabanas & white sands",
    alt: "Private white-sand beach with exclusive cabanas",
  },
];

const BADGES = [
  { icon: "🔒", label: "Private Tours" },
  { icon: "👨‍👩‍👧", label: "Family Safe" },
  { icon: "✦", label: "Luxury Options" },
  { icon: "🌴", label: "Trusted Guides" },
  { icon: "🕌", label: "Halal Friendly" },
];

const FLAGS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇲🇽", label: "Español" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goSlide = useCallback((n: number) => {
    setCurrent((n + SLIDES.length) % SLIDES.length);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => goSlide(current + 1), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [current, goSlide]);

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section className="flex min-h-[calc(100svh-72px)] flex-col overflow-hidden md:flex-row">
      {/* Left panel */}
      <div className="relative flex w-full shrink-0 flex-col justify-center overflow-hidden bg-cream px-6 py-11 md:w-[42%] md:min-w-[320px] md:px-[clamp(28px,4vw,60px)] md:py-[clamp(32px,4vw,64px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-2.5 right-2 z-0 select-none whitespace-nowrap font-serif text-[clamp(90px,11vw,148px)] leading-none text-forest/5"
        >
          أمانة
        </div>
        <div
          aria-hidden
          className="absolute bottom-[18%] left-0 top-[18%] w-1 rounded-r"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #C8693A 30%, #E8A84B 70%, transparent)",
          }}
        />
        <div className="relative z-10">
          <div
            className="animate-fade-up mb-[clamp(14px,1.6vw,22px)] flex items-center gap-2.5 text-[clamp(9px,0.8vw,10.5px)] font-semibold uppercase tracking-[3px] text-terracotta"
            style={{ animationDelay: "0.1s" }}
          >
            <span aria-hidden className="h-[1.5px] w-[26px] shrink-0 bg-terracotta" />
            Riviera Maya · Mexico
          </div>
          <h1
            className="animate-fade-up mb-[clamp(12px,1.4vw,18px)] font-serif text-[clamp(38px,5vw,64px)] font-semibold leading-[0.93] tracking-[clamp(-2.5px,-0.2vw,-1px)] text-ink"
            style={{ animationDelay: "0.22s" }}
          >
            The Real
            <br />
            <em className="italic text-forest">Riviera Maya.</em>
          </h1>
          <p
            className="animate-fade-up mb-[clamp(18px,2vw,28px)] max-w-[360px] text-[clamp(12px,1vw,14.5px)] leading-[1.78] text-sage"
            style={{ animationDelay: "0.36s" }}
          >
            Skip the crowds and the noise. Private tours, hidden cenotes, and
            Caribbean beaches — curated for families and couples who want
            something more than an ordinary holiday.
          </p>

          <div
            className="animate-fade-up mb-2 flex flex-wrap gap-[7px]"
            style={{ animationDelay: "0.5s" }}
          >
            {BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border border-sand bg-white px-3 py-[5px] text-[clamp(10px,0.85vw,12px)] font-medium text-forest transition hover:border-forest hover:shadow-[0_2px_10px_rgba(58,90,60,0.12)]"
              >
                <span aria-hidden>{b.icon}</span> {b.label}
              </span>
            ))}
          </div>

          <div
            className="animate-fade-up mb-[clamp(22px,2.4vw,34px)] mt-1 flex gap-2.5"
            style={{ animationDelay: "0.58s" }}
          >
            {FLAGS.map((f) => (
              <button
                key={f.code}
                title={f.label}
                aria-label={`Switch language: ${f.label}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-sand bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-forest hover:shadow-[0_4px_12px_rgba(58,90,60,0.15)] active:scale-95 active:bg-cream"
              >
                <span aria-hidden className="text-base leading-none">
                  {f.flag}
                </span>
              </button>
            ))}
          </div>

          <div
            className="animate-fade-up flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3"
            style={{ animationDelay: "0.64s" }}
          >
            <Link
              href="/activities"
              className="whitespace-nowrap rounded-full bg-gradient-to-br from-terracotta to-gold px-[clamp(20px,2vw,26px)] py-[clamp(10px,1vw,13px)] text-center text-[clamp(12px,1vw,14px)] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              Explore Activities →
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-[clamp(18px,1.8vw,22px)] py-[clamp(10px,1vw,12px)] text-center text-[clamp(12px,1vw,14px)] font-medium text-forest transition hover:bg-forest hover:text-white"
            >
              Talk to Us →
            </Link>
          </div>
        </div>
      </div>

      {/* Right panel — slideshow */}
      <div className="relative h-[62vw] max-h-[420px] min-h-[230px] w-full flex-1 overflow-hidden md:h-auto md:max-h-none md:min-h-0">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Edge blend & bottom gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-[5] hidden w-[90px] md:block"
          style={{ background: "linear-gradient(to right, #F5F0EA, transparent)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[200px]"
          style={{
            background: "linear-gradient(to top, rgba(10,28,14,0.72), transparent)",
          }}
        />

        <div className="absolute right-[22px] top-[22px] z-10 rounded-full border border-white/15 bg-black/28 px-3.5 py-[5px] text-[11.5px] font-medium tracking-[1px] text-white backdrop-blur-md">
          {pad(current)} / {pad(SLIDES.length - 1)}
        </div>

        <div className="absolute bottom-[26px] left-8 right-[26px] z-10 flex items-end justify-between gap-4 max-md:bottom-5 max-md:left-5 max-md:right-5">
          <div>
            <span className="mb-[5px] block font-serif text-[clamp(18px,1.8vw,24px)] font-semibold leading-none tracking-[-0.3px] text-white">
              {SLIDES[current].name}
            </span>
            <span className="text-[11.5px] uppercase tracking-[1.5px] text-white/65">
              {SLIDES[current].sub}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[7px]" role="tablist" aria-label="Slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}: ${s.name}`}
                onClick={() => goSlide(i)}
                className={`h-1.5 cursor-pointer rounded-[3px] transition-all duration-[400ms] ${
                  i === current ? "w-[22px] bg-gold" : "w-1.5 bg-white/38"
                }`}
              />
            ))}
          </div>
        </div>

        <div
          key={progressKey}
          className="progress-running absolute bottom-0 left-0 z-10 h-[2.5px] rounded-tr-sm"
          style={{
            background: "linear-gradient(90deg, #C8693A, #E8A84B)",
          }}
        />
      </div>
    </section>
  );
}

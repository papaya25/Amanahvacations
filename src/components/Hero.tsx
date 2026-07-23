"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_HERO, type HeroContent } from "@/lib/content/hero";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

/* Default slides keep hand-written alt text for SEO; DB slides fall back to
   the matching default's alt (by position) or the slide name. */
const DEFAULT_SLIDES = [
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

const BADGE_ICONS = ["🔒", "👨‍👩‍👧", "✦", "🌴", "🕌"] as const;
const BADGE_KEYS = [
  "hero_badge_private",
  "hero_badge_family",
  "hero_badge_luxury",
  "hero_badge_guides",
  "hero_badge_halal",
] as const;

const FLAGS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇲🇽", label: "Español" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
];

const PARTICLE_COLORS: [number, number, number][] = [
  [232, 168, 75],
  [200, 105, 58],
  [78, 205, 196],
  [245, 240, 234],
  [58, 90, 60],
];

function ParticleCurtain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    cv.width = cv.offsetWidth;
    cv.height = cv.offsetHeight;

    const pts = Array.from({ length: 90 }, () => {
      const col =
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      return {
        x: Math.random() * cv.width,
        y: cv.height * 0.85 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -(Math.random() * 2.4 + 1.0),
        r: Math.random() * 3.2 + 0.5,
        alpha: Math.random() * 0.75 + 0.2,
        col,
        wobble: Math.random() * Math.PI * 2,
        ws: (Math.random() - 0.5) * 0.05,
      };
    });

    const RISE = 2000;
    const FADE = 800;
    let start: number | null = null;
    let raf = 0;

    const draw = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      if (elapsed > RISE) {
        const f = Math.min(1, (elapsed - RISE) / FADE);
        cv.style.opacity = String(1 - f);
        if (f >= 1) {
          cv.style.display = "none";
          return;
        }
      }
      ctx.clearRect(0, 0, cv.width, cv.height);
      const fadeIn = Math.min(1, elapsed / 300);
      for (const p of pts) {
        p.wobble += p.ws;
        p.x += p.vx + Math.sin(p.wobble) * 0.5;
        p.y += p.vy;
        const [r, g, b] = p.col;
        ctx.save();
        if (r === 232) {
          ctx.shadowBlur = 7;
          ctx.shadowColor = "rgba(232,168,75,0.65)";
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * fadeIn})`;
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3]"
    />
  );
}

export default function Hero({ content = DEFAULT_HERO }: { content?: HeroContent }) {
  const { locale, dict } = useI18n();
  const L = (href: string) => localizeHref(href, locale);
  const BADGES = BADGE_ICONS.map((icon, i) => ({ icon, label: dict[BADGE_KEYS[i]] }));
  const SLIDES = (content.slides.length ? content.slides : DEFAULT_HERO.slides).map((s, i) => ({
    src: s.image,
    name: s.name,
    sub: s.sub,
    alt: DEFAULT_SLIDES[i]?.alt ?? s.name,
  }));
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef(0);

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

  const slideImages = (sizes: string) =>
    SLIDES.map((s, i) => (
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
          sizes={sizes}
          className="object-cover"
        />
      </div>
    ));

  const dots = (small: boolean) => (
    <div
      className={`flex shrink-0 items-center ${small ? "gap-1.5" : "gap-[7px]"}`}
      role="tablist"
      aria-label="Slides"
    >
      {SLIDES.map((s, i) => (
        <button
          key={s.src}
          role="tab"
          aria-selected={i === current}
          aria-label={`Slide ${i + 1}: ${s.name}`}
          onClick={() => goSlide(i)}
          className={`cursor-pointer rounded-[3px] transition-all duration-[400ms] ${
            small ? "h-[5px]" : "h-1.5"
          } ${
            i === current
              ? `${small ? "w-[18px]" : "w-[22px]"} bg-gold`
              : `${small ? "w-[5px]" : "w-1.5"} bg-white/38`
          }`}
        />
      ))}
    </div>
  );

  const progressBar = (
    <div
      key={progressKey}
      className="progress-running absolute bottom-0 left-0 z-10 h-[2.5px] rounded-tr-sm"
      style={{ background: "linear-gradient(90deg, #C8693A, #E8A84B)" }}
    />
  );

  return (
    <>
      {/* ── MOBILE: full-screen slideshow with content on top ── */}
      <section
        className="relative flex min-h-[calc(100svh-84px)] flex-col overflow-hidden bg-night md:hidden"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const diff = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) goSlide(current + (diff > 0 ? 1 : -1));
        }}
      >
        {slideImages("100vw")}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[75%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,18,10,0.78) 0%, rgba(5,18,10,0.55) 40%, rgba(5,18,10,0.18) 70%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[45%]"
          style={{
            background:
              "linear-gradient(to top, rgba(5,18,10,0.82) 0%, transparent 100%)",
          }}
        />
        <ParticleCurtain />

        <div className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10.5px] font-medium tracking-[1px] text-white backdrop-blur-md">
          {pad(current)} / {pad(SLIDES.length - 1)}
        </div>

        <div className="relative z-10 flex flex-col px-7 pt-12">
          <div className="mb-4 flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[22px] shrink-0 bg-terracotta" />
            Riviera Maya · Mexico
          </div>
          <h1 className="mb-4 font-serif text-[52px] font-semibold leading-[0.94] tracking-[-2px] text-white">
            {content.headline}
            <br />
            <em className="block italic text-gold">{content.headlineEm}</em>
          </h1>
          <p className="mb-5 max-w-[320px] text-[13.5px] font-light leading-[1.72] text-white/68">
            {dict.hero_mobile_tagline}
          </p>
          <div className="mb-5 flex flex-wrap gap-[7px]">
            {BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-[5px] text-[11px] font-medium text-white/85 backdrop-blur-md"
              >
                <span aria-hidden>{b.icon}</span> {b.label}
              </span>
            ))}
          </div>
          <div className="mb-5 flex gap-2">
            {FLAGS.map((f, i) => (
              <button
                key={f.code}
                title={f.label}
                aria-label={`Switch language: ${f.label}`}
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border bg-white/10 backdrop-blur-md transition active:scale-95 ${
                  i === 0
                    ? "border-gold bg-gold/20"
                    : "border-white/25"
                }`}
              >
                <span aria-hidden className="text-sm leading-none">
                  {f.flag}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Link
              href={L("/activities")}
              className="w-3/4 rounded-full bg-gradient-to-br from-terracotta to-gold px-6 py-3 text-center text-[13.5px] font-semibold text-white active:opacity-85"
            >
              {dict.hero_explore} ↓
            </Link>
            <Link
              href={L("/contact")}
              className="w-3/4 rounded-full border-[1.5px] border-white/35 bg-white/10 px-6 py-3 text-center text-[13.5px] font-medium text-white backdrop-blur-md active:bg-white/20"
            >
              {dict.hero_talk} →
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-5">
          <div>
            <span className="mb-1 block font-serif text-[20px] font-semibold leading-none tracking-[-0.2px] text-white">
              {SLIDES[current].name}
            </span>
            <span className="text-[10px] uppercase tracking-[1.5px] text-white/55">
              {SLIDES[current].sub}
            </span>
          </div>
          {dots(true)}
        </div>
        {progressBar}
      </section>

      {/* ── DESKTOP: split panel ── */}
      <section className="hidden min-h-[calc(100svh-84px)] flex-row overflow-hidden md:flex">
        {/* Left panel */}
        <div className="relative flex w-[42%] min-w-[320px] shrink-0 flex-col justify-center overflow-hidden bg-cream px-[clamp(28px,4vw,60px)] py-[clamp(32px,4vw,64px)]">
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
              {content.headline}
              <br />
              <em className="italic text-forest">{content.headlineEm}</em>
            </h1>
            <p
              className="animate-fade-up mb-[clamp(18px,2vw,28px)] max-w-[360px] text-[clamp(12px,1vw,14.5px)] leading-[1.78] text-sage"
              style={{ animationDelay: "0.36s" }}
            >
              {content.tagline}
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
              className="animate-fade-up flex items-center gap-3"
              style={{ animationDelay: "0.64s" }}
            >
              <Link
                href={L("/activities")}
                className="whitespace-nowrap rounded-full bg-gradient-to-br from-terracotta to-gold px-[clamp(20px,2vw,26px)] py-[clamp(10px,1vw,13px)] text-center text-[clamp(12px,1vw,14px)] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
              >
                {dict.hero_explore} →
              </Link>
              <Link
                href={L("/contact")}
                className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-[clamp(18px,1.8vw,22px)] py-[clamp(10px,1vw,12px)] text-center text-[clamp(12px,1vw,14px)] font-medium text-forest transition hover:bg-forest hover:text-white"
              >
                {dict.hero_talk} →
              </Link>
            </div>
          </div>
        </div>

        {/* Right panel — slideshow */}
        <div className="relative flex-1 overflow-hidden">
          {slideImages("58vw")}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-[5] w-[90px]"
            style={{ background: "linear-gradient(to right, #F5F0EA, transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[200px]"
            style={{
              background:
                "linear-gradient(to top, rgba(10,28,14,0.72), transparent)",
            }}
          />

          <div className="absolute right-[22px] top-[22px] z-10 rounded-full border border-white/15 bg-black/28 px-3.5 py-[5px] text-[11.5px] font-medium tracking-[1px] text-white backdrop-blur-md">
            {pad(current)} / {pad(SLIDES.length - 1)}
          </div>

          <div className="absolute bottom-[26px] left-8 right-[26px] z-10 flex items-end justify-between gap-4">
            <div>
              <span className="mb-[5px] block font-serif text-[clamp(18px,1.8vw,24px)] font-semibold leading-none tracking-[-0.3px] text-white">
                {SLIDES[current].name}
              </span>
              <span className="text-[11.5px] uppercase tracking-[1.5px] text-white/65">
                {SLIDES[current].sub}
              </span>
            </div>
            {dots(false)}
          </div>
          {progressBar}
        </div>
      </section>
    </>
  );
}

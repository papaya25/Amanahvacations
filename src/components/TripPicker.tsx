"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

type SceneId = "basic" | "family" | "water" | "explorer" | "honeymoon" | "luxury";

type Scene = {
  accent: string;
  tint: string;
  em: string;
  tag: string;
  name: string;
  desc: string;
  waveCol: [string, string, string];
  url: string;
};

const SCENES: Record<SceneId, Scene> = {
  basic: {
    accent: "#3A8A5E",
    tint: "rgba(20,90,55,1)",
    em: "essential",
    tag: "Essential Riviera Maya",
    name: "The Basics",
    desc: "Cenotes, Xcaret Park & the heart of Playa del Carmen",
    waveCol: ["#0A5A3A", "#0D7A50", "#109A68"],
    url: "/packages?plan=basic",
  },
  family: {
    accent: "#C8503A",
    tint: "rgba(140,60,30,1)",
    em: "unforgettable",
    tag: "Kid-Friendly",
    name: "Family Tour",
    desc: "Tulum, cenotes, the aquarium & Xsenses — fun for every age",
    waveCol: ["#7A2A10", "#9A3A18", "#BA4A20"],
    url: "/packages?plan=family",
  },
  water: {
    accent: "#1C8CA0",
    tint: "rgba(10,90,110,1)",
    em: "refreshing",
    tag: "Water & Reef",
    name: "Water Lovers",
    desc: "Akumal turtles, cenotes & Xel-Há — pure Caribbean blue",
    waveCol: ["#0A4A5A", "#0D6A80", "#1088A0"],
    url: "/packages?plan=water",
  },
  explorer: {
    accent: "#1E64C8",
    tint: "rgba(10,45,120,1)",
    em: "ancient",
    tag: "Culture & Wonders",
    name: "Indiana Jones",
    desc: "Chichén Itzá, Tulum ruins & the heart of Mayan civilization",
    waveCol: ["#0A2A6A", "#0D3A8A", "#1050AA"],
    url: "/packages?plan=explorer",
  },
  honeymoon: {
    accent: "#C84B78",
    tint: "rgba(120,25,60,1)",
    em: "romantic",
    tag: "Romance & Intimacy",
    name: "Honeymoon Escape",
    desc: "Holbox nights, Isla Contoy & a dinner just for two",
    waveCol: ["#6A1A3A", "#8A2050", "#AA3068"],
    url: "/packages?plan=honeymoon",
  },
  luxury: {
    accent: "#E8C860",
    tint: "rgba(90,60,10,1)",
    em: "exclusive",
    tag: "VIP Premium",
    name: "VIP Plan",
    desc: "Private villa, yacht & 24/7 concierge — nothing less",
    waveCol: ["#5A3A00", "#7A5410", "#9A6A20"],
    url: "/packages?plan=vip",
  },
};

const VIBES: { id: SceneId; label: string }[] = [
  { id: "basic", label: "🌿 Essentials" },
  { id: "family", label: "👨‍👩‍👧 Family" },
  { id: "water", label: "🌊 Water & Reef" },
  { id: "explorer", label: "🏛️ Culture" },
  { id: "honeymoon", label: "💞 Honeymoon & Couple" },
  { id: "luxury", label: "✦ Luxury" },
];

const WAVE_LAYERS = [
  { amp: 16, wl: 0.012, spd: 0.015, y: 0.28 },
  { amp: 11, wl: 0.02, spd: 0.022, y: 0.46 },
  { amp: 8, wl: 0.03, spd: 0.034, y: 0.62 },
  { amp: 5, wl: 0.042, spd: 0.048, y: 0.76 },
  { amp: 3, wl: 0.058, spd: 0.062, y: 0.88 },
];

const DEFAULT_WAVE: [string, string, string] = ["#0A3A5A", "#0D5070", "#106888"];

export default function TripPicker() {
  const [picked, setPicked] = useState<SceneId | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveState = useRef({
    current: DEFAULT_WAVE as string[],
    target: DEFAULT_WAVE as string[],
    blend: 1,
  });

  // Animated wave canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      cv.width = cv.offsetWidth || 390;
      cv.height = 130;
    };
    resize();
    window.addEventListener("resize", resize);

    const parse = (s: string): [number, number, number] => {
      if (s.startsWith("rgb")) {
        const m = s.match(/[\d.]+/g)!;
        return [+m[0], +m[1], +m[2]];
      }
      const v = parseInt(s.replace("#", ""), 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    };
    const lerpColor = (c1: string, c2: string, f: number) => {
      const a = parse(c1);
      const b = parse(c2);
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(
        a[1] + (b[1] - a[1]) * f
      )},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
    };
    const getCol = (i: number) => {
      const ws = waveState.current;
      const idx = Math.min(i, 2);
      return ws.blend >= 1
        ? ws.current[idx]
        : lerpColor(ws.current[idx], ws.target[idx], ws.blend);
    };

    const draw = () => {
      const W = cv.width;
      const H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const ws = waveState.current;
      if (ws.blend < 1) ws.blend = Math.min(1, ws.blend + 0.02);

      WAVE_LAYERS.forEach((L, i) => {
        const col = getCol(i);
        const alpha = 0.5 + i * 0.09;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const y = H * L.y + Math.sin(x * L.wl + t * L.spd * 60) * L.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Foam sparkles
      for (let x = 0; x <= W; x += 30) {
        const y =
          H * WAVE_LAYERS[0].y +
          Math.sin(x * WAVE_LAYERS[0].wl + t * WAVE_LAYERS[0].spd * 60) *
            WAVE_LAYERS[0].amp -
          1;
        const s = Math.sin(x * 0.07 + t * 2) * 0.5 + 0.5;
        if (s > 0.68) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,240,220,${s * 0.55})`;
          ctx.fill();
        }
      }

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pick = (id: SceneId) => {
    setPicked(id);
    const ws = waveState.current;
    ws.target = SCENES[id].waveCol;
    ws.blend = 0;
    setTimeout(() => {
      ws.current = ws.target;
      ws.blend = 1;
    }, 900);
  };

  const { locale, dict } = useI18n();
  // Overlay translated copy (em/tag/name/desc) onto the scene by id; visual
  // fields (colors, url) stay as-is.
  const scene = picked
    ? {
        ...SCENES[picked],
        em: dict[`tp_em_${picked}` as const],
        tag: dict[`tp_tag_${picked}` as const],
        name: dict[`tp_name_${picked}` as const],
        desc: dict[`tp_desc_${picked}` as const],
      }
    : null;
  const VIBE_LABELS: Record<SceneId, string> = {
    basic: dict.tp_vibe_basic,
    family: dict.tp_vibe_family,
    water: dict.tp_vibe_water,
    explorer: dict.tp_vibe_explorer,
    honeymoon: dict.tp_vibe_honeymoon,
    luxury: dict.tp_vibe_luxury,
  };
  const VIBE_EMOJI: Record<SceneId, string> = {
    basic: "🌿", family: "👨‍👩‍👧", water: "🌊", explorer: "🏛️", honeymoon: "💞", luxury: "✦",
  };

  return (
    <section
      className="relative min-h-[620px] overflow-hidden bg-night md:min-h-[680px]"
      aria-labelledby="packages-heading"
    >
      {/* Background photo + tint */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: "url('/images/hero-cenotes.jpg')",
          backgroundPosition: "center 25%",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply transition-all duration-[900ms]"
        style={{
          background: scene?.tint ?? "transparent",
          opacity: scene ? 0.28 : 0,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[55%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[55%]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-[2] h-[130px] w-full"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[620px] flex-col items-center justify-center px-6 pb-[150px] pt-16 text-center md:min-h-[680px]">
        <div className="mb-3.5 text-[10px] font-semibold uppercase tracking-[3.5px] text-white/45">
          {dict.tp_eyebrow}
        </div>
        <h2
          id="packages-heading"
          className="mb-4 font-serif text-[clamp(38px,4.5vw,56px)] font-semibold leading-[1.02] tracking-[-1.5px] text-white"
        >
          {dict.tp_your}{" "}
          <em
            className="block italic transition-colors duration-700"
            style={{ color: scene?.accent ?? "#E8A84B" }}
          >
            {scene?.em ?? dict.tp_default_em}
          </em>
          {dict.tp_starts_here}
        </h2>
        <p className="mb-7 text-[13px] tracking-[0.8px] text-white/55">
          {dict.tp_pick_style}
        </p>

        <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5 sm:max-w-[560px] sm:grid-cols-3">
          {VIBES.map((v) => {
            const active = picked === v.id;
            const accent = SCENES[v.id].accent;
            return (
              <button
                key={v.id}
                onClick={() => pick(v.id)}
                aria-pressed={active}
                className="flex items-center justify-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-[11px] text-[13px] font-medium backdrop-blur-md transition-all duration-300"
                style={{
                  borderColor: active ? accent : "rgba(255,255,255,0.28)",
                  background: active ? `${accent}28` : "rgba(255,255,255,0.09)",
                  color: active ? "white" : "rgba(255,255,255,0.78)",
                  boxShadow: active ? "0 8px 22px rgba(0,0,0,0.45)" : "none",
                }}
              >
                {VIBE_EMOJI[v.id]} {VIBE_LABELS[v.id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reveal card */}
      <div
        className={`absolute inset-x-4 bottom-[18px] z-[12] mx-auto max-w-[560px] rounded-[18px] border border-white/20 bg-white/11 p-[16px_18px] backdrop-blur-2xl transition-all duration-500 ${
          scene
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[22px] opacity-0"
        }`}
        aria-hidden={!scene}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <div
              className="mb-1 text-[9px] font-bold uppercase tracking-[2px] transition-colors duration-500"
              style={{ color: scene?.accent ?? "#E8A84B" }}
            >
              {scene?.tag}
            </div>
            <div className="font-serif text-[22px] font-semibold leading-none text-white">
              {scene?.name}
            </div>
            <div className="mt-1 text-[11.5px] leading-[1.55] text-white/60">
              {scene?.desc}
            </div>
          </div>
          <Link
            href={localizeHref(scene?.url ?? "/packages", locale)}
            className="shrink-0 rounded-full bg-white px-6 py-[11px] text-center text-[13px] font-bold text-ink transition active:scale-[0.97]"
          >
            {dict.tp_see_plan}
          </Link>
        </div>
      </div>
    </section>
  );
}

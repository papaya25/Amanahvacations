/* Thin line icons for the VIP and Halal pages — drawn to match the stroke
   style of the VIP services icons (1.2 stroke, round caps, gold via CSS). */

const S = { fill: "none" } as const;

export const IconCenote = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* cave mouth over water */}
    <path d="M6 30 Q6 10 24 8 Q42 10 42 30" />
    <path d="M12 30 Q12 16 24 14 Q36 16 36 30" opacity="0.55" />
    <path d="M4 36 Q12 33 20 36 Q28 39 36 36 Q41 34 44 36" />
    <path d="M8 41 Q16 38 24 41 Q32 44 40 41" opacity="0.5" />
    <line x1="24" y1="20" x2="24" y2="26" />
    <circle cx="24" cy="30" r="1.4" />
  </svg>
);

export const IconBeach = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* parasol */}
    <path d="M8 22 Q16 8 32 12" />
    <path d="M8 22 Q14 18 20 20 Q17 14 21 11 Q26 9 32 12" opacity="0.6" />
    <line x1="20" y1="16" x2="28" y2="40" />
    {/* lounger */}
    <path d="M28 34 h12" />
    <path d="M30 40 h12" />
    <line x1="40" y1="34" x2="42" y2="40" />
    {/* sand line */}
    <path d="M4 42 Q14 40 24 42 Q34 44 44 42" opacity="0.5" />
  </svg>
);

export const IconYacht = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M6 32c4-2 12-3 18-3s14 1 18 3" />
    <path d="M8 34 Q24 40 40 34" />
    <line x1="24" y1="10" x2="24" y2="32" />
    <path d="M24 12 L38 28 L24 28 Z" />
    <path d="M24 16 L14 28 L24 28 Z" opacity="0.55" />
    <line x1="24" y1="28" x2="38" y2="28" />
    <path d="M4 38 Q12 36 20 38 Q28 40 36 38 Q42 36 44 38" opacity="0.5" />
  </svg>
);

export const IconTemple = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* stepped Mayan pyramid */}
    <path d="M18 12 h12 v6 h-12 z" />
    <path d="M14 18 h20 v6 h-20 z" />
    <path d="M10 24 h28 v6 h-28 z" />
    <path d="M6 30 h36 v6 h-36 z" />
    <line x1="24" y1="12" x2="24" y2="36" opacity="0.5" />
    <line x1="4" y1="40" x2="44" y2="40" />
  </svg>
);

export const IconHeli = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <line x1="10" y1="12" x2="38" y2="12" />
    <line x1="24" y1="12" x2="24" y2="17" />
    <path d="M14 25 Q14 17 24 17 Q36 17 36 25 Q36 31 28 31 H18 Q14 31 14 25 Z" />
    <path d="M36 23 h5 l-3 6 h-6" opacity="0.6" />
    <line x1="18" y1="31" x2="18" y2="35" />
    <line x1="30" y1="31" x2="30" y2="35" />
    <line x1="13" y1="35" x2="35" y2="35" />
    <line x1="20" y1="24" x2="26" y2="24" opacity="0.6" />
  </svg>
);

export const IconPark = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* ferris wheel */}
    <circle cx="24" cy="22" r="14" />
    <circle cx="24" cy="22" r="2" />
    <line x1="24" y1="8" x2="24" y2="14" />
    <line x1="24" y1="30" x2="24" y2="36" />
    <line x1="10" y1="22" x2="16" y2="22" />
    <line x1="32" y1="22" x2="38" y2="22" />
    <line x1="14" y1="12" x2="18" y2="16" opacity="0.6" />
    <line x1="34" y1="12" x2="30" y2="16" opacity="0.6" />
    <path d="M18 36 L14 42 M30 36 L34 42" />
    <line x1="10" y1="42" x2="38" y2="42" />
  </svg>
);

export const IconDining = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* cloche */}
    <path d="M10 32 Q10 22 24 22 Q38 22 38 32" />
    <line x1="6" y1="32" x2="42" y2="32" />
    <circle cx="24" cy="20" r="1.8" />
    <line x1="8" y1="37" x2="40" y2="37" opacity="0.6" />
    {/* crescent accent */}
    <path d="M33 10 a5 5 0 1 0 4 8 a6.5 6.5 0 1 1 -4 -8" opacity="0.7" />
  </svg>
);

export const IconMosque = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* dome */}
    <path d="M14 28 Q14 16 24 12 Q34 16 34 28" />
    <line x1="24" y1="8" x2="24" y2="12" />
    <circle cx="24" cy="6.5" r="1.2" />
    {/* minaret */}
    <path d="M8 28 V18 l2 -3 2 3 v10" opacity="0.65" />
    <path d="M36 28 V18 l2 -3 2 3 v10" opacity="0.65" />
    {/* base + arch door */}
    <path d="M10 28 h28 v10 h-28 z" />
    <path d="M21 38 v-5 q3 -3 6 0 v5" />
  </svg>
);

export const IconVilla = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M8 24 L24 10 L40 24" />
    <path d="M12 22 v16 h24 v-16" />
    <path d="M21 38 v-8 h6 v8" />
    <path d="M16 27 h4 v4 h-4 z" opacity="0.6" />
    <path d="M28 27 h4 v4 h-4 z" opacity="0.6" />
    <line x1="6" y1="40" x2="42" y2="40" />
  </svg>
);

export const IconFamily = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    {/* two adults, one child */}
    <circle cx="14" cy="14" r="4" />
    <path d="M7 34 Q7 22 14 22 Q21 22 21 34" />
    <circle cx="34" cy="14" r="4" />
    <path d="M27 34 Q27 22 34 22 Q41 22 41 34" />
    <circle cx="24" cy="26" r="3" />
    <path d="M19 40 Q19 31 24 31 Q29 31 29 40" />
    <line x1="6" y1="40" x2="42" y2="40" opacity="0.5" />
  </svg>
);

export const IconWaves = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M4 18 Q10 14 16 18 Q22 22 28 18 Q34 14 40 18 Q43 20 44 19" />
    <path d="M4 27 Q10 23 16 27 Q22 31 28 27 Q34 23 40 27 Q43 29 44 28" opacity="0.7" />
    <path d="M4 36 Q10 32 16 36 Q22 40 28 36 Q34 32 40 36 Q43 38 44 37" opacity="0.45" />
  </svg>
);

export const IconLeaf = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M38 10 Q16 12 12 30 Q10 38 16 38 Q34 38 38 10 Z" />
    <path d="M14 36 Q22 24 34 16" opacity="0.6" />
    <path d="M20 30 l-2 6 M26 24 l-1 5 M31 19 l-1 4" opacity="0.45" />
  </svg>
);

export const IconNoAlcohol = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <circle cx="24" cy="24" r="17" />
    <line x1="12" y1="12" x2="36" y2="36" />
    <path d="M19 16 h10 l-4 8 v8" opacity="0.6" />
    <line x1="21" y1="34" x2="29" y2="34" opacity="0.6" />
  </svg>
);

export const IconPool = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <line x1="16" y1="10" x2="16" y2="32" />
    <line x1="28" y1="10" x2="28" y2="32" />
    <path d="M16 16 h12 M16 22 h12 M16 28 h12" opacity="0.6" />
    <path d="M4 36 Q10 32 16 36 Q22 40 28 36 Q34 32 40 36 Q43 38 44 37" />
  </svg>
);

export const IconBed = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M6 30 V16" />
    <path d="M6 24 h36 v10" />
    <path d="M6 30 h36" opacity="0.6" />
    <path d="M10 24 v-4 q0 -2 2 -2 h6 q2 0 2 2 v4" opacity="0.6" />
    <line x1="6" y1="34" x2="6" y2="38" />
    <line x1="42" y1="34" x2="42" y2="38" />
  </svg>
);

export const IconBell = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M8 34c0-8.84 7.16-16 16-16s16 7.16 16 16" />
    <line x1="4" y1="34" x2="44" y2="34" />
    <circle cx="24" cy="15" r="2.2" />
    <line x1="24" y1="34" x2="24" y2="38" opacity="0.6" />
  </svg>
);

export const IconCar = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M4 30h40v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
    <path d="M4 30l4-10h28l6 10" />
    <path d="M12 20l4-8h14l4 8" />
    <circle cx="13" cy="34" r="4" />
    <circle cx="35" cy="34" r="4" />
    <circle cx="13" cy="34" r="1.5" />
    <circle cx="35" cy="34" r="1.5" />
    <path d="M16 22h16" />
    <line x1="24" y1="22" x2="24" y2="30" />
  </svg>
);

export const IconCompass = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <circle cx="24" cy="24" r="18" />
    <circle cx="24" cy="24" r="12" />
    <polygon points="24,9 26.5,22 24,20 21.5,22" />
    <polygon points="24,39 26.5,26 24,28 21.5,26" opacity="0.45" />
    <line x1="24" y1="6" x2="24" y2="10" />
    <line x1="24" y1="38" x2="24" y2="42" />
    <line x1="6" y1="24" x2="10" y2="24" />
    <line x1="38" y1="24" x2="42" y2="24" />
    <circle cx="24" cy="24" r="2" />
  </svg>
);

export const IconConcierge = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M8 34c0-8.84 7.16-16 16-16s16 7.16 16 16" />
    <line x1="4" y1="34" x2="44" y2="34" />
    <circle cx="24" cy="17" r="2.5" />
    <line x1="24" y1="34" x2="24" y2="40" />
    <line x1="16" y1="40" x2="32" y2="40" />
    <line x1="24" y1="8" x2="24" y2="12" />
    <line x1="20" y1="10" x2="22" y2="13" />
    <line x1="28" y1="10" x2="26" y2="13" />
  </svg>
);

export const IconChef = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M16 22 Q14 10 24 8 Q34 10 32 22" />
    <rect x="14" y="22" width="20" height="4" rx="1" />
    <path d="M10 36 Q10 28 24 28 Q38 28 38 36" />
    <line x1="8" y1="36" x2="40" y2="36" />
    <circle cx="24" cy="27" r="1.8" />
    <line x1="10" y1="40" x2="38" y2="40" />
    <path d="M19 16 Q19 12 22 12" opacity="0.6" />
    <path d="M26 16 Q26 12 29 13" opacity="0.6" />
  </svg>
);

export const IconScroll = (
  <svg viewBox="0 0 48 48" {...S} aria-hidden>
    <path d="M12 10 Q8 10 8 14 Q8 18 12 18" />
    <path d="M36 10 Q40 10 40 14 Q40 18 36 18" />
    <rect x="12" y="8" width="24" height="32" rx="2" />
    <path d="M12 40 Q8 40 8 36 Q8 32 12 32" />
    <path d="M36 40 Q40 40 40 36 Q40 32 36 32" />
    <line x1="17" y1="16" x2="31" y2="16" />
    <line x1="17" y1="21" x2="31" y2="21" />
    <line x1="17" y1="26" x2="27" y2="26" />
    <path d="M24 31 l1.5 3 3 .4-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3-2.2-2.1 3-.4z" strokeWidth="1" />
  </svg>
);

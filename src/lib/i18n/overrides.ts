/* Hand-curated translation overrides. These win over both the cache and the AI
   translator, so brand/travel terms are always correct and consistent across
   the whole site. Keyed by the EXACT English source string, per locale.

   Use this for anything the AI gets wrong or renders inconsistently (e.g. ATV,
   which must be "Quad" in French — not "VTT", a mountain bike). Add entries as
   they're spotted; matching is exact and case-sensitive. */

import type { Locale } from "./config";

export const OVERRIDES: Partial<Record<Locale, Record<string, string>>> = {
  fr: {
    // Package / trip-style names (kept consistent everywhere they appear)
    "Honeymoon Escape": "Escapade Romantique",
    "Honeymoon & Couple": "Lune de miel & couple",

    // ATV = quad bike in French (never "VTT", which is a mountain bicycle)
    "Zipline & ATV": "Tyrolienne & Quad",
    "Zipline & ATV Adventure": "Aventure Tyrolienne & Quad",
    "A jungle adventure combining zipline and ATV riding — availability depends on the day, our team will confirm.":
      "Une aventure dans la jungle alliant tyrolienne et quad — la disponibilité dépend du jour, notre équipe confirmera.",
  },
  es: {
    "Zipline & ATV": "Tirolesa y Cuatrimoto",
  },
  ar: {},
};

/* Locale configuration — the single source of truth for supported
   languages. "en" is the default and is served WITHOUT a URL prefix
   (amanahvacations.com/packages); the others are served under their own
   prefix (amanahvacations.com/fr/packages, /es/, /ar/). */

export const LOCALES = ["en", "fr", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
};

export const LOCALE_LABELS: Record<Locale, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "English" },
  fr: { flag: "🇫🇷", label: "Français" },
  es: { flag: "🇲🇽", label: "Español" },
  ar: { flag: "🇸🇦", label: "العربية" },
};

export const RTL_LOCALES: Locale[] = ["ar"];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Strip a locale prefix from a pathname, returning the locale-free path.
    "/fr/packages" -> "/packages"; "/packages" -> "/packages" (unchanged). */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (seg && isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

/** Build the URL for `pathname` (locale-free) in `locale`. English has no
    prefix; other locales are prefixed. */
export function localizeHref(pathname: string, locale: Locale): string {
  const clean = stripLocale(pathname);
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

"use client";

/* Client-side access to the current locale and the translated UI dictionary,
   set once by the server layout for the whole page tree — same pattern as
   CurrencyProvider/CartProvider elsewhere in this codebase. */

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Dict } from "./dictionary";

type I18nValue = { locale: Locale; dict: Dict };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

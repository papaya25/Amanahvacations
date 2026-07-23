"use client";

/* Global display currency. All prices are stored in MXN (the base). The header
   selector changes the display currency and every price on the site converts
   and re-renders. Rates live here for now; the admin dashboard will edit them
   (and the base prices) once the backend is wired. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Currency = "USD" | "MXN" | "EUR";

// MXN per 1 unit of the currency (so display = mxn / RATE).
export const RATES: Record<Currency, number> = {
  MXN: 1,
  USD: 17,
  EUR: 19.5,
};

export const SYMBOLS: Record<Currency, string> = {
  MXN: "$",
  USD: "$",
  EUR: "€",
};

export const CURRENCIES: Currency[] = ["USD", "MXN", "EUR"];

const STORAGE_KEY = "amanah_currency";
const DEFAULT: Currency = "USD";

export function convert(mxn: number, currency: Currency) {
  return Math.round(mxn / RATES[currency]);
}

export function formatIn(mxn: number, currency: Currency) {
  return `${SYMBOLS[currency]}${convert(mxn, currency).toLocaleString("en-US")} ${currency}`;
}

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format an MXN amount in the current display currency, e.g. "$271 USD". */
  format: (mxn: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export type CurrencySettings = {
  defaultCurrency: Currency;
  rateUSD: number; // MXN per 1 USD
  rateEUR: number; // MXN per 1 EUR
};

export function CurrencyProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings?: CurrencySettings;
}) {
  const initial =
    settings && CURRENCIES.includes(settings.defaultCurrency) ? settings.defaultCurrency : DEFAULT;
  const [currency, setCurrencyState] = useState<Currency>(initial);

  const rates = useMemo<Record<Currency, number>>(
    () => ({
      MXN: 1,
      USD: settings?.rateUSD && settings.rateUSD > 0 ? settings.rateUSD : RATES.USD,
      EUR: settings?.rateEUR && settings.rateEUR > 0 ? settings.rateEUR : RATES.EUR,
    }),
    [settings?.rateUSD, settings?.rateEUR]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (raw && CURRENCIES.includes(raw)) setCurrencyState(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      format: (mxn: number) =>
        `${SYMBOLS[currency]}${Math.round(mxn / rates[currency]).toLocaleString("en-US")} ${currency}`,
    }),
    [currency, setCurrency, rates]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

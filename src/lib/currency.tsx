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

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT);

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
    () => ({ currency, setCurrency, format: (mxn: number) => formatIn(mxn, currency) }),
    [currency, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

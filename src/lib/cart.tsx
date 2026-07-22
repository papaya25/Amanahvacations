"use client";

/* Client-side cart, persisted to localStorage. Each item is a fully-configured
   booking (a package, tour, or activity with its own dates/people/add-ons and a
   precomputed MXN total), so there is no per-item quantity stepper in the cart —
   items are added or removed whole. When we wire Supabase later, this same shape
   syncs to a logged-in user's server cart. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const USD_RATE = 17;
const STORAGE_KEY = "amanah_cart_v1";

export type CartItemInput = {
  kind: "package" | "tour" | "activity";
  title: string;
  subtitle?: string;
  image?: string;
  details: string[];
  total: number; // MXN line total for this configured booking
  people: number;
  meta?: Record<string, string>;
};

export type CartItem = CartItemInput & { id: string };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItemInput) => void;
  remove: (id: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [items, ready]);

  const add = useCallback((item: CartItemInput) => {
    setItems((prev) => [...prev, { ...item, id: newId() }]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    return { items, count: items.length, subtotal, add, remove, clear, ready };
  }, [items, add, remove, clear, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function fmtMXN(mxn: number) {
  return `$${Math.round(mxn).toLocaleString("en-US")} MXN`;
}

export function fmtUSD(mxn: number) {
  return `≈ $${Math.round(mxn / USD_RATE).toLocaleString("en-US")} USD`;
}

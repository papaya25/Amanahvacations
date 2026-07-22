"use client";

/* Local order store for the flow-first build. When Supabase is wired in, these
   read/write helpers get swapped for API calls, but the shape stays the same so
   the pages don't change. */

import type { CartItem } from "./cart";

const ORDERS_KEY = "amanah_orders_v1";

export type Order = {
  id: string;
  date: string; // ISO
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountLabel?: string;
  promo?: string;
  total: number;
  paymentMethod: string;
  contact: { name: string; email: string; whatsapp?: string };
  status: string;
};

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  if (typeof window === "undefined") return;
  const all = getOrders();
  all.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function newOrderId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `AMN-${n}`;
}

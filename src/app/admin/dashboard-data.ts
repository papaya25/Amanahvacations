import "server-only";

/* Data helpers for the admin dashboard. All reads go through the service
   client (pages are behind the admin login). */

import { createAdminClient } from "@/lib/supabase/admin";
import type { CartItem } from "@/lib/cart";

export type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  customer_name: string;
  customer_email: string;
  user_id: string | null;
};

export async function getAllOrders(): Promise<OrderRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,created_at,status,items,subtotal,discount,total,payment_method,customer_name,customer_email,user_id"
    )
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("getAllOrders:", error.message);
    return [];
  }
  return (data as OrderRow[]) ?? [];
}

export type CustomerRow = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  confirmed: boolean;
};

export async function getCustomers(): Promise<CustomerRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("getCustomers:", error.message);
    return [];
  }
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string) ?? "",
    created_at: u.created_at,
    confirmed: Boolean(u.email_confirmed_at),
  }));
}

/** Calendar events parsed from order items: tour dates and package check-ins. */
export type BookingEvent = { date: string; orderId: string; label: string }; // date = YYYY-MM-DD

export function extractBookingEvents(orders: OrderRow[]): BookingEvent[] {
  const events: BookingEvent[] = [];
  const toKey = (raw: string | undefined): string | null => {
    if (!raw) return null;
    const t = Date.parse(raw);
    if (Number.isNaN(t)) return null;
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  for (const o of orders) {
    if (o.status === "Cancelled") continue;
    for (const it of o.items) {
      const key = toKey(it.meta?.date) ?? toKey(it.meta?.checkin);
      if (key) events.push({ date: key, orderId: o.id, label: it.title });
    }
  }
  return events;
}

export const fmtMXN = (n: number) => `$${n.toLocaleString("en-US")} MXN`;

/** True for orders that count as sales (everything except cancelled). */
export const isSale = (o: OrderRow) => o.status !== "Cancelled";

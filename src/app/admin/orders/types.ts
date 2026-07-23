import type { CartItem } from "@/lib/cart";

export type AdminOrder = {
  id: string;
  created_at: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discount_label: string | null;
  promo_code: string | null;
  total: number;
  payment_method: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string | null;
  notes: string | null;
  consent: boolean;
  consent_at: string | null;
};

export const ORDER_STATUSES = [
  "Pending payment",
  "Pending confirmation",
  "Paid (test mode)",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

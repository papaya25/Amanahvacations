import { getSessionUser } from "@/lib/supabase/serverAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import OrdersList, { type AccountOrder } from "./OrdersList";
import type { CartItem } from "@/lib/cart";

// Always show the customer's latest orders.
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  created_at: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  status: string;
};

export default async function OrdersPage() {
  // Middleware guarantees a session on /account/*; treat no-user as empty.
  const user = await getSessionUser();
  let orders: AccountOrder[] = [];
  if (user) {
    const supabase = createAdminClient();
    // The user's own orders, plus guest orders placed with the same email.
    const { data } = await supabase
      .from("orders")
      .select("id,created_at,items,total,payment_method,status")
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .limit(50);
    orders = ((data as Row[] | null) ?? []).map((r) => ({
      id: r.id,
      date: r.created_at,
      items: r.items,
      total: r.total,
      paymentMethod: r.payment_method,
      status: r.status,
    }));
  }
  return <OrdersList orders={orders} />;
}

import { listOrders } from "./actions";
import OrdersClient from "./OrdersClient";

// Always show the latest bookings.
export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const orders = await listOrders();
  return <OrdersClient initial={orders ?? []} />;
}

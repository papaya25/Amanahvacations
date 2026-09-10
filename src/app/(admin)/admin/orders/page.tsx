import { listOrders } from "./actions";
import OrdersClient from "./OrdersClient";
import { getSavedTours } from "@/lib/content/tours";
import { getAllPackages } from "@/lib/content/packages";
import { TOURS } from "@/app/(public)/[locale]/tours/data";

// Always show the latest bookings.
export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const [orders, tours, packages] = await Promise.all([
    listOrders(),
    getSavedTours(),
    getAllPackages(),
  ]);
  // Pickers for the manual-order form: id/key + display name.
  const tourOptions = (tours ?? TOURS.filter((t) => t.key).map((t) => ({ key: t.key!, name: t.name })))
    .map((t) => ({ id: t.key, name: t.name }))
    .filter((t) => t.id);
  const packageOptions = (packages ?? []).map((p) => ({ id: p.id, name: p.name }));
  return (
    <OrdersClient initial={orders ?? []} tourOptions={tourOptions} packageOptions={packageOptions} />
  );
}

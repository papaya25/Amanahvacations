import { getAllPackages } from "@/lib/content/packages";
import PackagesAdminClient, { DEFAULT_PACKAGES } from "./PackagesAdminClient";

// Always read the latest content from the DB (no static caching in admin).
export const dynamic = "force-dynamic";

export default async function PackagesAdmin() {
  const db = await getAllPackages();
  const initial = db && db.length ? db : DEFAULT_PACKAGES;
  return <PackagesAdminClient initial={initial} />;
}

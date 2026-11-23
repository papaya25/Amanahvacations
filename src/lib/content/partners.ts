import "server-only";

/* Partners & affiliates (private site_content "partners"), with the built-in
   defaults until the admin saves the Partners page once. */

import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { DEFAULT_PARTNERS, type Partner } from "@/lib/accounting";

export async function getPartners(): Promise<Partner[]> {
  if (!adminConfigured) return DEFAULT_PARTNERS;
  const { data } = await createAdminClient().from("site_content").select("data").eq("key", "partners").maybeSingle();
  const list = (data?.data as { list?: Partner[] } | null)?.list;
  return list?.length ? list : DEFAULT_PARTNERS;
}

"use server";

/* Promo-code validation. Runs on the server with the admin client so the list
   of valid codes is never exposed to the browser (the `promos` section is
   excluded from public reads by row-level security). Full server-side
   enforcement — recording usage against orders — arrives with the orders
   backend (Step 3); until then the amount is still recomputed client-side for
   display only. */

import { createAdminClient } from "@/lib/supabase/admin";

export type PromoDef = { type: "pct" | "flat"; value: number; label: string };

type StoredPromo = { code: string; type: "pct" | "flat"; value: number; label: string; active: boolean };

// Demo codes used while the admin hasn't saved a promo list yet.
const FALLBACK: Record<string, PromoDef> = {
  AMANAH10: { type: "pct", value: 10, label: "10% off" },
  WELCOME500: { type: "flat", value: 500, label: "$500 MXN off" },
};

export async function validatePromo(codeRaw: string): Promise<PromoDef | null> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "promos")
      .maybeSingle();
    if (error) return FALLBACK[code] ?? null;
    const promos = (data?.data as { promos?: StoredPromo[] } | null)?.promos;
    if (!promos?.length) return FALLBACK[code] ?? null;
    const hit = promos.find((p) => p.active && p.code.trim().toUpperCase() === code);
    return hit ? { type: hit.type, value: hit.value, label: hit.label } : null;
  } catch {
    return FALLBACK[code] ?? null;
  }
}

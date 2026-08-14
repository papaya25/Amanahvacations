"use server";

/* Promo-code validation and discount computation. Runs on the server with the
   admin client so the list of valid codes is never exposed to the browser (the
   `promos` section is excluded from public reads by row-level security).

   `applyPromo` is the single source of truth for what a code is worth: it
   checks the promo's conditions (minimum spend, minimum group size, eligible
   categories) against the cart and computes the discount over the ELIGIBLE
   items only. The checkout page calls it for display; `placeOrder` calls it
   again with the server-verified line totals, so the discount actually stored
   with an order can never be tampered with from the browser. */

import { createAdminClient } from "@/lib/supabase/admin";

export type PromoCategory = "package" | "tour" | "activity";

const ALL_CATS: PromoCategory[] = ["package", "tour", "activity"];

type StoredPromo = {
  code: string;
  type: "pct" | "flat";
  value: number;
  label: string;
  active: boolean;
  /** Minimum eligible-items subtotal (MXN); 0/undefined = no minimum. */
  minSpend?: number;
  /** Minimum group size on an eligible item; 0/undefined = no minimum. */
  minPeople?: number;
  /** Categories the code applies to; empty/undefined = all categories. */
  cats?: PromoCategory[];
};

/** The slice of a cart line the promo engine needs. */
export type PromoLine = { kind: string; total: number; people: number };

export type PromoOutcome =
  | { ok: true; code: string; label: string; amount: number }
  | {
      ok: false;
      reason: "invalid" | "no_eligible" | "min_spend" | "min_people";
      minSpend?: number;
      minPeople?: number;
    };

// Demo codes used while the admin hasn't saved a promo list yet.
const FALLBACK: StoredPromo[] = [
  { code: "AMANAH10", type: "pct", value: 10, label: "10% off", active: true },
  { code: "WELCOME500", type: "flat", value: 500, label: "$500 MXN off", active: true },
];

async function findPromo(codeRaw: string): Promise<StoredPromo | null> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return null;
  let promos: StoredPromo[] = FALLBACK;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", "promos")
      .maybeSingle();
    const saved = (data?.data as { promos?: StoredPromo[] } | null)?.promos;
    if (!error && saved?.length) promos = saved;
  } catch {
    /* fall through to the fallback list */
  }
  return promos.find((p) => p.active && p.code.trim().toUpperCase() === code) ?? null;
}

/** Validate a code against the cart and compute its discount (MXN). */
export async function applyPromo(codeRaw: string, lines: PromoLine[]): Promise<PromoOutcome> {
  const promo = await findPromo(codeRaw);
  if (!promo) return { ok: false, reason: "invalid" };

  const cats = promo.cats?.length ? promo.cats : ALL_CATS;
  const eligible = lines.filter((l) => cats.includes(l.kind as PromoCategory));
  const eligibleSubtotal = eligible.reduce((s, l) => s + Math.max(0, Number(l.total) || 0), 0);
  if (!eligible.length || eligibleSubtotal <= 0) return { ok: false, reason: "no_eligible" };

  const minSpend = Math.max(0, Number(promo.minSpend) || 0);
  if (minSpend && eligibleSubtotal < minSpend)
    return { ok: false, reason: "min_spend", minSpend };

  // "Group size" is the largest party among the eligible items (the same
  // guests may appear on several lines, so summing would double-count them).
  const minPeople = Math.max(0, Number(promo.minPeople) || 0);
  const groupSize = eligible.reduce((m, l) => Math.max(m, Number(l.people) || 1), 0);
  if (minPeople && groupSize < minPeople)
    return { ok: false, reason: "min_people", minPeople };

  const amount =
    promo.type === "pct"
      ? Math.round((eligibleSubtotal * promo.value) / 100)
      : Math.min(promo.value, eligibleSubtotal);
  return { ok: true, code: promo.code.trim().toUpperCase(), label: promo.label, amount };
}

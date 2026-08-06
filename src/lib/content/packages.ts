/* Packages content — the single source of truth is the `packages` table in
   Supabase. Public pages read visible packages (server-rendered for SEO); the
   admin editor reads all of them and writes changes back. */

import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";
import { parseTierPrices, tourTotalFor } from "@/app/(public)/[locale]/tours/data";
import { PKG_TIERS, type PkgId } from "@/app/(public)/[locale]/packages/data";

export type Package = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number; // per person at the smallest group ("from" anchor), MXN
  offer: number; // legacy per-person sale price; 0 = no offer
  /** TOTAL group price (MXN) keyed by pax count — the price authority. */
  prices?: Record<string, number> | null;
  hidden: boolean;
  photo: string;
  includes: string; // one item per line
  sort_order: number;
};

const COLUMNS = "id,name,tagline,badge,price,offer,prices,hidden,photo,includes,sort_order";

/** Visible packages, ordered for display. For public pages. Returns null when
    the backend isn't configured so callers can fall back to built-in content. */
export async function getPublicPackages(): Promise<Package[] | null> {
  if (!supabaseConfigured) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("packages")
    .select(COLUMNS)
    .eq("hidden", false)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getPublicPackages:", error.message);
    return null;
  }
  return data as Package[];
}

/** All packages including hidden ones, for the admin editor. */
export async function getAllPackages(): Promise<Package[] | null> {
  if (!supabaseConfigured) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("packages")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getAllPackages:", error.message);
    return null;
  }
  return data as Package[];
}

/** Authoritative server-side total (MXN) for ONE activity booked on its own
    (Build Your Own Plan / single-activity booking): tiered tour-type
    activities charge their group total, flat ones charge per person. Returns
    null for on-request/unknown/not-directly-bookable activities — those are
    never charged online. */
export async function getActivityLineTotal(
  activityId: string,
  people: number
): Promise<number | null> {
  const n = Math.max(1, people || 1);
  const { ACTIVITIES } = await import("@/app/(public)/[locale]/packages/data");
  const b = ACTIVITIES.find((a) => a.id === activityId);
  if (b?.groupPrices) return tourTotalFor(b, n);
  const { getSavedAddons } = await import("@/lib/content/addons");
  const saved = await getSavedAddons();
  const s = saved?.find((a) => a.id === activityId);
  if (s && !s.onRequest && s.price > 0) {
    const unit = s.offer && s.offer > 0 && s.offer < s.price ? s.offer : s.price;
    return unit * n;
  }
  if (b && b.inCart && b.price !== null && b.price > 0) return b.price * n;
  return null;
}

/** Authoritative server-side total for a configured package booking, matching
    the configurator's own math exactly: the package's GROUP-TIER total for the
    group size (honeymoon is always the 2-traveller price), plus the selected
    add-ons — tour-type add-ons at their tiered group total, flat add-ons
    × people, the recommended add-on × the package multiplier. Returns null for
    on-request/unknown packages (VIP etc.) — those are never charged online.
    Used at checkout so a tampered browser can never change the amount
    actually charged. */
export async function getPackageLineTotal(
  pkgId: string,
  people: number,
  addonIds: string[]
): Promise<number | null> {
  const n = Math.max(1, people || 1);
  const mult = pkgId === "honeymoon" ? 2 : n;

  const pkgs = await getPublicPackages();
  const db = pkgs?.find((p) => p.id === pkgId);
  const tiers =
    (db ? parseTierPrices(db.prices ?? undefined) : null) ??
    PKG_TIERS[pkgId as PkgId] ??
    null;
  if (!tiers) return null; // VIP / on-request / unknown
  const base = tourTotalFor({ groupPrices: tiers, price: null }, mult);
  if (base === null) return null;

  let total = base;

  if (addonIds.length) {
    const { getSavedAddons } = await import("@/lib/content/addons");
    const { ACTIVITIES, RECOMMENDED } = await import(
      "@/app/(public)/[locale]/packages/data"
    );
    const saved = await getSavedAddons();
    const rec = RECOMMENDED[pkgId as keyof typeof RECOMMENDED];

    for (const id of addonIds) {
      // Recommended add-on: flat per-person catalogue price × the package
      // multiplier (mirrors the configurator, incl. honeymoon's fixed ×2).
      if (rec && id === rec.id) {
        total += rec.price * mult;
        continue;
      }
      const b = ACTIVITIES.find((a) => a.id === id);
      // Tour-type add-ons carry group tiers — charged once for the group.
      if (b?.groupPrices) {
        total += tourTotalFor(b, n) ?? 0;
        continue;
      }
      // Flat per-person add-ons: admin-saved price wins over the catalogue.
      const s = saved?.find((a) => a.id === id);
      const unit =
        s && !s.onRequest && s.price > 0
          ? s.offer && s.offer > 0 && s.offer < s.price
            ? s.offer
            : s.price
          : b?.price ?? 0;
      total += (unit > 0 ? unit : 0) * n;
    }
  }

  return total;
}

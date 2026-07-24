/* Packages content — the single source of truth is the `packages` table in
   Supabase. Public pages read visible packages (server-rendered for SEO); the
   admin editor reads all of them and writes changes back. */

import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";

export type Package = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number; // per person, MXN
  offer: number; // sale price; 0 = no offer
  hidden: boolean;
  photo: string;
  includes: string; // one item per line
  sort_order: number;
};

const COLUMNS = "id,name,tagline,badge,price,offer,hidden,photo,includes,sort_order";

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

/* Built-in defaults, kept in sync with PackagesClient — the fallback when the
   packages table isn't reachable, so server-side price checks still work. */
const DEFAULT_PKG_PRICE: Record<string, { price: number; offer: number }> = {
  basic: { price: 4600, offer: 0 },
  family: { price: 8200, offer: 0 },
  water: { price: 7600, offer: 6650 },
  explorer: { price: 11850, offer: 0 },
  honeymoon: { price: 14300, offer: 0 },
};

/** Authoritative server-side total for a configured package booking, matching
    the configurator's own math (base × people, ×2 for honeymoon, plus the
    selected add-ons). Offer prices win. Returns null for on-request/unknown
    packages (VIP etc.) — those are never charged online. Used at checkout so a
    tampered browser can never change the amount actually charged. */
export async function getPackageLineTotal(
  pkgId: string,
  people: number,
  addonIds: string[]
): Promise<number | null> {
  const n = Math.max(1, people || 1);
  const mult = pkgId === "honeymoon" ? 2 : n;

  const pkgs = await getPublicPackages();
  const db = pkgs?.find((p) => p.id === pkgId);
  const base = db
    ? { price: db.price, offer: db.offer }
    : DEFAULT_PKG_PRICE[pkgId];
  if (!base || base.price <= 0) return null; // VIP / on-request
  const unit = base.offer > 0 && base.offer < base.price ? base.offer : base.price;

  let total = unit * mult;

  if (addonIds.length) {
    const { getSavedAddons } = await import("@/lib/content/addons");
    const { ACTIVITIES, RECOMMENDED } = await import(
      "@/app/(public)/[locale]/packages/data"
    );
    const saved = await getSavedAddons();
    const recId = RECOMMENDED[pkgId as keyof typeof RECOMMENDED]?.id;

    const addonUnit = (id: string): number => {
      const s = saved?.find((a) => a.id === id);
      if (s && !s.onRequest && s.price > 0)
        return s.offer && s.offer > 0 && s.offer < s.price ? s.offer : s.price;
      const b = ACTIVITIES.find((a) => a.id === id);
      if (b && b.price && b.price > 0) return b.price;
      const rec = Object.values(RECOMMENDED).find((r) => r?.id === id);
      return rec ? rec.price : 0;
    };

    for (const id of addonIds) {
      // The recommended add-on is priced ×mult (matches the configurator);
      // for every non-honeymoon package mult === n, so this only differs for
      // honeymoon.
      const m = id === recId ? mult : n;
      total += addonUnit(id) * m;
    }
  }

  return total;
}

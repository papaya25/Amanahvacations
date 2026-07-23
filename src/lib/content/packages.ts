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

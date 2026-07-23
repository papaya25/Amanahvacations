/* Public content reads for server-rendered pages. Uses the browser-safe key
   (SELECT-only, and only for public sections per row-level security). Always
   pass a fallback equal to the page's built-in content so the page renders
   unchanged until the section has been saved in admin. */

import { createPublicClient, supabaseConfigured } from "@/lib/supabase/public";

/** Raw saved data for a section, or null if the admin never saved it (or the
    backend is unreachable). Use when a page keeps richer built-in content until
    the admin takes over that section. */
export async function getSavedContent<T>(key: string): Promise<Partial<T> | null> {
  if (!supabaseConfigured) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.data) return null;
    return data.data as Partial<T>;
  } catch {
    return null;
  }
}

export async function getPublicContent<T>(key: string, fallback: T): Promise<T> {
  if (!supabaseConfigured) return fallback;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.data) return fallback;
    // Merge saved fields over the fallback so missing keys keep sensible values.
    return { ...fallback, ...(data.data as Partial<T>) } as T;
  } catch {
    return fallback;
  }
}

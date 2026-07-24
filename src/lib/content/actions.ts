"use server";

/* Generic content read/write for the admin editors. Both run only on the
   server and use the service_role key, so they work for every section —
   including the internal ones (emails, costs) that the public key can't read.

   Both require a valid admin session cookie (see adminAuth) — the proxy
   guards the admin pages, and this guards the actions themselves. */

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Read one section's stored data (or null if never saved / backend down). */
export async function loadContent<T = unknown>(key: string): Promise<T | null> {
  try {
    if (!(await isAdminRequest())) return null;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    if (error) {
      console.error(`loadContent(${key}):`, error.message);
      return null;
    }
    return (data?.data as T) ?? null;
  } catch (e) {
    console.error(`loadContent(${key}):`, e instanceof Error ? e.message : e);
    return null;
  }
}

/** Save one section's data and refresh the public site. */
export async function saveContent(key: string, data: unknown): Promise<SaveResult> {
  try {
    if (!(await isAdminRequest())) {
      return { ok: false, error: "Not logged in — please log in to the admin again." };
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, data }, { onConflict: "key" });
    if (error) return { ok: false, error: error.message };

    // Content can appear anywhere (footer, legal, pages), so refresh everything.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error saving content" };
  }
}

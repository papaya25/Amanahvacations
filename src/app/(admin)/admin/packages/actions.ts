"use server";

/* Admin write path for packages. Runs only on the server and uses the
   service_role key (via createAdminClient), so it can write despite the
   read-only row-level-security policy on the public key. After saving it
   revalidates the public pages so edits appear live immediately. */

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export type PackageInput = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number;
  offer: number;
  /** TOTAL group price (MXN) per pax count; 0/absent sizes aren't offered. */
  prices?: Record<string, number> | null;
  hidden: boolean;
  photo: string;
  includes: string;
};

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function savePackages(packages: PackageInput[]): Promise<SaveResult> {
  try {
    if (!(await isAdminRequest())) {
      return { ok: false, error: "Not logged in — please log in to the admin again." };
    }
    const supabase = createAdminClient();

    // Persist display order from the editor's current ordering.
    const rows = packages.map((p, i) => {
      // Keep only valid tier entries; the per-person `price` anchor is derived
      // from the smallest offered group so the "From" display never drifts.
      const tiers: Record<string, number> = {};
      Object.entries(p.prices ?? {}).forEach(([k, v]) => {
        const pax = Number(k);
        const total = Math.round(Number(v) || 0);
        if (pax > 0 && total > 0) tiers[String(pax)] = total;
      });
      const paxes = Object.keys(tiers).map(Number).sort((a, b) => a - b);
      const fromPP = paxes.length ? Math.round(tiers[String(paxes[0])] / paxes[0]) : Math.round(Number(p.price) || 0);
      return {
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        badge: p.badge,
        price: fromPP,
        offer: Math.round(Number(p.offer) || 0),
        prices: paxes.length ? tiers : null,
        hidden: Boolean(p.hidden),
        photo: p.photo,
        includes: p.includes,
        sort_order: i + 1,
      };
    });

    // Remove any packages the admin deleted (rows in the DB not in this payload).
    const keepIds = rows.map((r) => r.id);
    const del = supabase.from("packages").delete();
    const { error: delErr } = keepIds.length
      ? await del.not("id", "in", `(${keepIds.map((id) => `"${id}"`).join(",")})`)
      : await del.gte("sort_order", 0); // no packages kept → clear the table
    if (delErr) return { ok: false, error: delErr.message };

    if (rows.length) {
      const { error: upErr } = await supabase.from("packages").upsert(rows, { onConflict: "id" });
      if (upErr) return { ok: false, error: upErr.message };
    }

    // Refresh the pages that render package content.
    revalidatePath("/packages");
    revalidatePath("/");

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error saving packages" };
  }
}

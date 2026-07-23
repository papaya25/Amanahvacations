/* Add-on experiences — written by /admin/addons into site_content key
   "addons". Drives the "Add Experiences" lists in the packages configurator.
   Emoji and descriptions aren't admin-editable yet, so they carry over from
   the built-in list by id. */

import { getSavedContent } from "@/lib/content/site";

export type AdminAddon = {
  id: string;
  name: string;
  price: number;
  offer?: number;
  unit: string;
  onRequest: boolean;
  hidden?: boolean;
};

/** Saved add-ons (visible only, in saved order), or null if never saved. */
export async function getSavedAddons(): Promise<AdminAddon[] | null> {
  const saved = await getSavedContent<{ addons: AdminAddon[] }>("addons");
  if (!saved?.addons?.length) return null;
  return saved.addons.filter((a) => !a.hidden);
}

export type TransferTier = { label: string; price: number };

export type TransfersContent = {
  enabled: boolean;
  perPerson: number;
  tiers: TransferTier[];
  conditions: string;
};

/** Saved transfers settings, or null if never saved (checkout defaults to enabled). */
export function getSavedTransfers() {
  return getSavedContent<TransfersContent>("transfers");
}

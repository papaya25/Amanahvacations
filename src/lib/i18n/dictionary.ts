import "server-only";

/* Static UI chrome strings (nav, footer, common labels). English is the
   source of truth; other locales are produced by translateDict (cached —
   see translate.ts), so this file only needs to be written once in English. */

import { translateDict } from "./translate";
import type { Locale } from "./config";

export const EN_DICT = {
  nav_home: "Home",
  nav_activities: "Activities",
  nav_packages: "Packages",
  nav_tours: "Tours",
  nav_vip: "VIP",
  nav_about: "About",
  nav_contact: "Contact",
  login: "Log In",
  menu: "Menu",

  footer_explore: "Explore",
  footer_support: "Support",
  footer_airport_transfers: "Airport Transfers",
  footer_halal: "Halal Friendly Options",
  footer_terms: "Terms & Conditions",
  footer_privacy: "Privacy Policy",
  footer_waiver: "Liability Waiver",
  footer_rights: "All Rights Reserved",
  footer_tagline: "Trust in Adventure",
  footer_brand_desc:
    "Trust in Adventure. Private tours, hidden cenotes and Caribbean beaches in the Riviera Maya — curated for families and couples, halal-friendly on request.",
} as const;

export type Dict = typeof EN_DICT;

export async function getDictionary(locale: Locale): Promise<Dict> {
  return translateDict(EN_DICT, locale);
}

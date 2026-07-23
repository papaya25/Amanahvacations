/* Shared contact/social details. The admin "Contact & Social" editor writes
   these to the `contact` row of site_content; public server components read
   them via getContact() so one edit updates the footer, contact page, etc. */

import { getPublicContent } from "@/lib/content/site";

export type ContactInfo = {
  phone: string;
  whatsapp: string; // digits only, for wa.me links
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  formRecipient: string;
};

export const DEFAULT_CONTACT: ContactInfo = {
  phone: "+52 984 452 1184",
  whatsapp: "529844521184",
  email: "booking@amanahvacations.com",
  address: "Playa del Carmen, Riviera Maya, Quintana Roo, Mexico",
  instagram: "https://www.instagram.com/amanahvacations/",
  facebook: "https://www.facebook.com/profile.php?id=61591849591722",
  tiktok: "",
  youtube: "",
  formRecipient: "booking@amanahvacations.com",
};

/** Contact details for public server components (falls back to defaults). */
export function getContact(): Promise<ContactInfo> {
  return getPublicContent<ContactInfo>("contact", DEFAULT_CONTACT);
}

/* Activities/destinations content — written by /admin/activities into
   site_content key "activities" (title, card image, first paragraph, hidden,
   add/remove). Merged over the rich built-in DESTINATIONS data so detail pages
   keep their hero images, extra paragraphs and tags. */

import { DESTINATIONS, type Destination } from "@/data/destinations";
import { getSavedContent } from "@/lib/content/site";

export type AdminActivity = {
  slug: string;
  title: string;
  card: string;
  desc: string;
  hidden?: boolean;
};

/** The destination list the public site should show: the admin's saved list
    (visible entries, their order) merged over built-in data by slug; falls
    back to the full built-in list if the admin never saved. */
export async function getEffectiveDestinations(): Promise<Destination[]> {
  const saved = await getSavedContent<{ activities: AdminActivity[] }>("activities");
  if (!saved?.activities?.length) return DESTINATIONS;

  return saved.activities
    .filter((a) => !a.hidden)
    .map((a) => {
      const base = DESTINATIONS.find((d) => d.slug === a.slug);
      if (base) {
        return {
          ...base,
          title: a.title || base.title,
          card: a.card || base.card,
          paragraphs: a.desc ? [a.desc, ...base.paragraphs.slice(1)] : base.paragraphs,
        };
      }
      // Admin-added activity with no built-in page: render a minimal detail page.
      return {
        slug: a.slug,
        title: a.title,
        alt: a.title,
        card: a.card,
        hero: a.card,
        paragraphs: a.desc ? [a.desc] : [],
        tags: [],
      };
    });
}

export async function getEffectiveDestination(slug: string): Promise<Destination | undefined> {
  const all = await getEffectiveDestinations();
  return all.find((d) => d.slug === slug);
}

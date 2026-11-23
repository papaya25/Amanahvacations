/* Detail-page addresses for tours, packages and parks. Client-safe (the
   listing cards link to these). */

/* Stable, readable addresses. Never change a published slug — add a redirect
   instead. New catalogue items fall back to a slug of their English name. */
export const TOUR_SLUGS: Record<string, string> = {
  akumalcenotes: "akumal-sea-turtles-cenotes",
  tulumcenotes: "tulum-ruins-cenotes",
  cobacenotes: "coba-ruins-cenotes",
  cozumel: "cozumel-private-boat-snorkeling",
  akumaltulum: "tulum-akumal",
  chichen: "chichen-itza-valladolid",
  rutacenotes: "ruta-de-cenotes",
  siankaan: "sian-kaan",
  "jungle-adventure": "jungle-adventure",
  holbox: "holbox-island",
  "isla-contoy-national-park": "isla-contoy",
};
export const PACKAGE_SLUGS: Record<string, string> = {
  basic: "the-basics",
  family: "family-tour",
  water: "water-lovers",
  explorer: "indiana-jones",
  honeymoon: "honeymoon-escape",
};
export const PARK_SLUGS: Record<string, string> = {
  xcaret: "xcaret-plus",
  xelha: "xel-ha",
  xplor: "xplor",
  xplorfuego: "xplor-fuego",
  xsenses: "xenses",
  monkey: "akumal-monkey-sanctuary",
  parasailing: "parasailing-playa-del-carmen",
};

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


/* Unknown (newly added) items fall back to their stable id, never the
   display name — names are translated on the listing pages. */
export const tourSlug = (key: string) => TOUR_SLUGS[key] ?? slugify(key);
export const packageSlug = (id: string) => PACKAGE_SLUGS[id] ?? slugify(id);
export const parkSlug = (id: string) => PARK_SLUGS[id] ?? slugify(id);
export const tourPath = (key: string) => `/tours/${tourSlug(key)}`;
export const packagePath = (id: string) => `/packages/${packageSlug(id)}`;
export const parkPath = (id: string) => `/parks/${parkSlug(id)}`;

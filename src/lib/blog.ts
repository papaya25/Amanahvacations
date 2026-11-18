/* Blog article registry — one entry per article. Adding an article = add its
   page under src/app/(public)/[locale]/blog/<slug>/ and an entry here; the
   /blog index, sitemap and footer pick it up from this list. English source
   text; pages translate it per locale. */

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  /** ISO date of the last meaningful update. */
  updated: string;
  category: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "muslim-guide-playa-del-carmen-cancun",
    title: "Muslims in Playa del Carmen & Cancún",
    excerpt:
      "Mosques and Friday prayer, halal restaurants and halal meat, the hijab and burkini at the beach, and where Muslim families like to stay — a local guide from a Muslim-owned tour operator.",
    image: "/images/guide/muslim-traveler-tulum-terrace.jpg",
    imageAlt: "A traveler in a hijab looking out over the Tulum ruins and the Caribbean at sunset",
    updated: "2026-11-18",
    category: "Muslim travel",
  },
];

export const blogPath = (slug: string) => `/blog/${slug}`;

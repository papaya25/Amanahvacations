/* Shared SEO constants and structured-data builders. */

export const SITE_URL = "https://amanahvacations.com";

/* Per-locale canonical + hreflang alternates for a public page. English is
   the unprefixed default (x-default); each language canonicalizes to ITS OWN
   URL so Google can index all four versions instead of collapsing everything
   onto English. Pass the locale-free path ("/tours", "/"). */
export function pageAlternates(locale: string, path: string) {
  const p = path === "/" ? "" : path;
  return {
    canonical: locale === "en" ? p || "/" : `/${locale}${p}`,
    languages: {
      en: p || "/",
      fr: `/fr${p}`,
      es: `/es${p}`,
      ar: `/ar${p}`,
      "x-default": p || "/",
    },
  };
}
export const SITE_NAME = "Amanah Vacations";
export const WA_NUMBER = "+529903516948";
export const CONTACT_EMAIL = "booking@amanahvacations.com";

/* Organization / LocalBusiness — site-wide identity for Google. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description:
      "Private, family-safe and halal-friendly tours, activities and travel packages across the Riviera Maya and Yucatán — Playa del Carmen, Tulum, Chichén Itzá, cenotes, Akumal and more.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/hero-cenotes.jpg`,
    telephone: WA_NUMBER,
    email: CONTACT_EMAIL,
    priceRange: "$$-$$$",
    areaServed: [
      "Playa del Carmen",
      "Tulum",
      "Cancún",
      "Riviera Maya",
      "Yucatán Peninsula",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Playa del Carmen",
      addressRegion: "Quintana Roo",
      addressCountry: "MX",
    },
    sameAs: [
      "https://www.instagram.com/amanahvacations/",
      "https://www.facebook.com/profile.php?id=61591849591722",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* A bookable tour/package as a Product with an Offer (price → rich result). */
export function productOfferSchema(opts: {
  name: string;
  description: string;
  image: string;
  url: string;
  priceMXN: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}`,
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_URL}${opts.url}`,
    offers: {
      "@type": "Offer",
      price: opts.priceMXN,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}${opts.url}`,
    },
  };
}

export function itemListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${it.url}`,
    })),
  };
}

export function touristAttractionSchema(opts: {
  name: string;
  description: string;
  image: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: opts.name,
    description: opts.description,
    image: opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}`,
    url: `${SITE_URL}${opts.url}`,
    isAccessibleForFree: false,
    touristType: ["Families", "Couples", "Muslim travelers", "Luxury travelers"],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Quintana Roo",
      addressCountry: "MX",
    },
  };
}

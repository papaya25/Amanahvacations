import type { Metadata } from "next";
import ParksClient from "./ParksClient";
import { PARKS, type Park } from "./data";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, itemListSchema, productOfferSchema, pageAlternates } from "@/lib/seo";
import { getSavedAddons } from "@/lib/content/addons";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import "../tours/tours.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Xcaret, Xel-Há, Xplor & More — Riviera Maya Parks with Private Transport",
    description:
      "Book the Riviera Maya's famous parks with ticket + private round-trip transportation included: Xcaret, Xel-Há, Xplor, Xplor Fuego, Xenses and the Akumal Monkey Sanctuary. Family-safe and halal-friendly.",
    keywords: [
      "Xcaret tickets with transport",
      "Xel-Há all inclusive park",
      "Xplor Playa del Carmen",
      "Xplor Fuego night park",
      "Xenses park",
      "Akumal monkey sanctuary",
      "Riviera Maya parks",
      "Cancún parks private transportation",
    ],
    openGraph: {
      type: "website",
      title: "Riviera Maya Parks — Ticket + Private Transport Included",
      description:
        "Xcaret, Xel-Há, Xplor, Xplor Fuego, Xenses and the Monkey Sanctuary — booked with private round-trip transportation from your hotel.",
      url: "/parks",
      images: ["/images/parks/xplor.jpg"],
    },
    alternates: pageAlternates(locale, "/parks"),
  };
}

export default async function ParksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  // Live per-person prices from the admin Add-ons catalogue (same ids); the
  // rate-card values in data.ts are the fallback. A park hidden in admin
  // disappears here too.
  const dbAddons = await getSavedAddons();
  const priceById: Record<string, number> = {};
  const hiddenIds = new Set<string>();
  (dbAddons ?? []).forEach((a) => {
    if (a.hidden) hiddenIds.add(a.id);
    else if (!a.onRequest && a.price > 0)
      priceById[a.id] = a.offer && a.offer > 0 && a.offer < a.price ? a.offer : a.price;
  });
  const parks: Park[] = PARKS.filter((p) => !hiddenIds.has(p.id)).map((p) => ({
    ...p,
    price: priceById[p.id] ?? p.price,
  }));

  // Translate the display copy for non-English locales (ids/prices untouched).
  const translated: Park[] =
    locale === "en"
      ? parks
      : await Promise.all(
          parks.map(async (p) => {
            const [sub, dur, desc] = await translateMany([p.sub, p.dur, p.desc], locale);
            return { ...p, sub, dur, desc };
          })
        );

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Parks", path: "/parks" },
          ]),
          itemListSchema(parks.map((p) => ({ name: p.name, url: "/parks" }))),
          ...parks.map((p) =>
            productOfferSchema({
              name: `${p.name} — ticket + private transport`,
              description: p.desc,
              image: p.img,
              url: "/parks",
              priceMXN: p.price,
            })
          ),
        ]}
      />
      <ParksClient parks={translated} />
    </main>
  );
}

import "server-only";

/* One detail page per tour, package and park (/tours/<slug>, /packages/<slug>,
   /parks/<slug>) — built ONLY from content that already exists: the admin's
   live catalogue (names, prices, itineraries) plus the built-in descriptions
   and package day-by-day texts. Booking stays on the listing pages (option B):
   every detail page's "Book" button deep-links to the card there. */

import { getSavedTours } from "@/lib/content/tours";
import { getPublicPackages } from "@/lib/content/packages";
import { getSavedAddons } from "@/lib/content/addons";
import { TOURS, parseTierPrices } from "@/app/(public)/[locale]/tours/data";
import { PARKS, PACKAGE_ONLY_PARKS } from "@/app/(public)/[locale]/parks/data";
import { PKG_DETAILS, PKG_TIERS, type PkgId } from "@/app/(public)/[locale]/packages/data";
import { packageSlug, parkSlug, slugify, tourSlug } from "@/lib/catalogSlugs";

export type CatalogKind = "tour" | "package" | "park";

export type CatalogPage = {
  kind: CatalogKind;
  id: string;
  slug: string;
  path: string; // /tours/<slug>
  bookHref: string; // the card on the listing page
  name: string;
  sub: string;
  dur: string;
  img: string;
  imgContain?: { bg: string }; // flat park logos sit on their brand colour
  intro: string[];
  stops: { time: string; place: string; desc: string }[];
  days: { title: string; dur: string; desc: string; included: string }[];
  includes: string[];
  week: string[];
  weekNote: string;
  /** Group-size pricing: [people, total MXN], smallest group first. */
  tiers: [number, number][];
  /** Per-person price (parks). */
  perPerson: number | null;
  onRequest: boolean;
};

const sortedTiers = (prices: Record<number, number> | null): [number, number][] =>
  prices ? Object.entries(prices).map(([k, v]) => [Number(k), v] as [number, number]).sort((a, b) => a[0] - b[0]) : [];

/** Standard Amanah promise — the same claims the site already makes everywhere. */
const PRIVATE_LINE =
  "Like every Amanah Vacations experience, it is 100% private: only your group, with private, air-conditioned transportation and pickup from your hotel or villa in Playa del Carmen and the Riviera Maya.";

export async function getTourPages(): Promise<CatalogPage[]> {
  const saved = await getSavedTours();
  const list = saved
    ? saved.map((t) => ({
        key: t.key,
        name: t.name,
        sub: t.sub,
        dur: t.dur,
        img: t.img,
        onreq: t.onreq,
        tiers: sortedTiers(t.onreq ? null : parseTierPrices(t.prices)),
        stops: t.stops,
        desc: (TOURS.find((b) => b.key === t.key) ?? TOURS.find((b) => b.name === t.name))?.desc ?? t.sub,
      }))
    : TOURS.map((t) => ({
        key: t.key ?? slugify(t.name),
        name: t.name,
        sub: t.sub,
        dur: t.dur,
        img: t.img,
        onreq: Boolean(t.onreq),
        tiers: sortedTiers(t.groupPrices ?? null),
        stops: t.stops.map(([time, place, desc]) => ({ time, place, desc })),
        desc: t.desc,
      }));
  return list.map((t) => {
    const slug = tourSlug(t.key);
    const places = t.stops.map((s) => s.place).filter((p) => !/playa del carmen|your hotel/i.test(p));
    return {
      kind: "tour",
      id: t.key,
      slug,
      path: `/tours/${slug}`,
      bookHref: `/tours#tour-${t.key}`,
      name: t.name,
      sub: t.sub,
      dur: t.dur,
      img: t.img,
      intro: [
        t.desc,
        ...(places.length > 1 ? [`Your day takes in ${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}.`] : []),
        PRIVATE_LINE,
      ],
      stops: t.stops,
      days: [],
      includes: [],
      week: [],
      weekNote: "",
      tiers: t.tiers,
      perPerson: null,
      onRequest: t.onreq || !t.tiers.length,
    } satisfies CatalogPage;
  });
}

export async function getPackagePages(): Promise<CatalogPage[]> {
  const pkgs = (await getPublicPackages()) ?? [];
  return pkgs
    .filter((p) => p.id !== "vip") // VIP has its own page (/vip)
    .map((p) => {
      const slug = packageSlug(p.id);
      const d = PKG_DETAILS[p.id as PkgId];
      const tiers = sortedTiers(parseTierPrices(p.prices ?? undefined) ?? PKG_TIERS[p.id as PkgId] ?? null);
      return {
        kind: "package",
        id: p.id,
        slug,
        path: `/packages/${slug}`,
        bookHref: `/packages?plan=${p.id}`,
        name: p.name,
        sub: p.tagline,
        dur: d ? `${d.week.length} days` : "",
        img: p.photo,
        intro: d ? [d.intro] : [p.tagline],
        stops: [],
        days: d?.days ?? [],
        includes: p.includes.split("\n").map((s) => s.trim()).filter(Boolean),
        week: d?.week ?? [],
        weekNote: d?.weekNote ?? "",
        tiers,
        perPerson: null,
        onRequest: !tiers.length,
      } satisfies CatalogPage;
    });
}

export async function getParkPages(): Promise<CatalogPage[]> {
  const addons = (await getSavedAddons()) ?? [];
  const priceById = new Map(
    addons
      .filter((a) => !a.onRequest && a.price > 0)
      .map((a) => [a.id, a.offer && a.offer > 0 && a.offer < a.price ? a.offer : a.price])
  );
  return PARKS.map((p) => {
    const slug = parkSlug(p.id);
    return {
      kind: "park",
      id: p.id,
      slug,
      path: `/parks/${slug}`,
      bookHref: PACKAGE_ONLY_PARKS.has(p.id) ? "/packages" : `/parks#park-${p.id}`,
      name: p.name,
      sub: p.sub,
      dur: p.dur,
      img: p.img,
      imgContain: p.imgFit === "contain" ? { bg: p.imgBg ?? "#ffffff" } : undefined,
      intro: [
        p.desc,
        "Booked with Amanah Vacations, your ticket comes with private round-trip transportation from your hotel or villa — no shuttle buses, no waiting for other guests.",
      ],
      stops: [],
      days: [],
      includes: [],
      week: [],
      weekNote: "",
      tiers: [],
      perPerson: priceById.get(p.id) ?? p.price,
      onRequest: false,
    } satisfies CatalogPage;
  });
}

export const getCatalogPages = (kind: CatalogKind) =>
  kind === "tour" ? getTourPages() : kind === "package" ? getPackagePages() : getParkPages();

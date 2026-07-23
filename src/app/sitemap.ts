import type { MetadataRoute } from "next";
import { getEffectiveDestinations } from "@/lib/content/activities";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const DESTINATIONS = await getEffectiveDestinations();

  const core: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/activities", priority: 0.9, freq: "weekly" },
    { path: "/packages", priority: 0.9, freq: "weekly" },
    { path: "/tours", priority: 0.9, freq: "weekly" },
    { path: "/vip", priority: 0.7, freq: "monthly" },
    { path: "/halal", priority: 0.8, freq: "monthly" },
    { path: "/airport-transfers", priority: 0.7, freq: "monthly" },
    { path: "/aboutus", priority: 0.5, freq: "monthly" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
    { path: "/terms-and-conditions", priority: 0.2, freq: "yearly" },
    { path: "/privacy-policy", priority: 0.2, freq: "yearly" },
    { path: "/liability-waiver", priority: 0.2, freq: "yearly" },
  ];

  const corePages = core.map((c) => ({
    url: `${SITE_URL}${c.path}`,
    lastModified: now,
    changeFrequency: c.freq,
    priority: c.priority,
  }));

  const destinationPages = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...corePages, ...destinationPages];
}

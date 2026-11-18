import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { SITE_URL, breadcrumbSchema, pageAlternates } from "@/lib/seo";
import { BLOG_POSTS, blogPath } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizeMetadata(locale, {
    title: "Travel Blog — Local Guides to Playa del Carmen & the Riviera Maya",
    description:
      "Local guides from Amanah Vacations in Playa del Carmen: where to eat, the best beaches, things to do, and practical travel advice for families and Muslim travelers.",
    alternates: pageAlternates(locale, "/blog"),
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const posts = [...BLOG_POSTS].sort((a, b) => b.updated.localeCompare(a.updated));

  const tr = await translateMany(
    [
      "Travel blog",
      "Local guides to Playa del Carmen & the Riviera Maya",
      "We live in Playa del Carmen. These are the guides we wish every guest had before they arrived — written from our own experience, and kept up to date.",
      "Read the guide →",
      "Updated",
      ...posts.flatMap((p) => [p.title, p.excerpt, p.category, p.imageAlt]),
    ],
    locale
  );
  const [eyebrow, h1, lede, readMore, labelUpdated] = tr;
  const t = posts.map((p, i) => ({
    ...p,
    title: tr[5 + i * 4],
    excerpt: tr[6 + i * 4],
    category: tr[7 + i * 4],
    imageAlt: tr[8 + i * 4],
  }));
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <main className="bg-cream">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Amanah Vacations Travel Blog",
            url: `${SITE_URL}${localizeHref("/blog", locale)}`,
            publisher: { "@id": `${SITE_URL}/#organization` },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${SITE_URL}${localizeHref(blogPath(p.slug), locale)}`,
              dateModified: p.updated,
              image: `${SITE_URL}${p.image}`,
            })),
          },
        ]}
      />

      <header className="mx-auto max-w-[1100px] px-5 pb-[clamp(24px,3vw,40px)] pt-[clamp(48px,7vw,104px)] lg:px-8">
        <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
          <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
          {eyebrow}
        </div>
        <h1 className="max-w-[820px] font-serif text-[clamp(36px,5vw,64px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
          {h1}
        </h1>
        <p className="mt-5 max-w-[640px] text-[clamp(15px,1.15vw,17px)] leading-[1.85] text-ink/75">{lede}</p>
      </header>

      <section className="mx-auto max-w-[1100px] px-5 pb-[clamp(56px,7vw,112px)] lg:px-8">
        <ul className="grid gap-[clamp(28px,3vw,44px)]">
          {t.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={localizeHref(blogPath(p.slug), locale)}
                className={`group grid items-center gap-[clamp(20px,3vw,48px)] border-t border-sand pt-[clamp(28px,3vw,44px)] ${
                  i === 0 ? "md:grid-cols-[1.25fr_1fr]" : "md:grid-cols-[1fr_1.4fr]"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[2.5px] text-terracotta">
                    {p.category} · {labelUpdated} <time dateTime={p.updated}>{fmt(p.updated)}</time>
                  </div>
                  <h2 className="mt-2 font-serif text-[clamp(26px,2.8vw,38px)] font-semibold leading-[1.08] text-ink transition group-hover:text-forest">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-[1.8] text-ink/75">{p.excerpt}</p>
                  <span className="mt-4 inline-block text-[14px] font-semibold text-forest underline underline-offset-2">
                    {readMore}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import Price from "@/components/Price";
import { breadcrumbSchema, clip, faqSchema, pageAlternates, productOfferSchema } from "@/lib/seo";
import { localizeMetadata } from "@/lib/i18n/metadata";
import { translateMany } from "@/lib/i18n/translate";
import { isLocale, localizeHref, type Locale } from "@/lib/i18n/config";
import { getContact } from "@/lib/content/contact";
import { getCatalogPages, type CatalogKind, type CatalogPage } from "@/lib/catalogPages";

/* Shared detail page for a tour, package or park. Server-rendered and
   translated per locale; booking happens on the listing page (the "Book"
   button deep-links to the item's card there). */

const LISTING: Record<CatalogKind, { path: string; crumb: string }> = {
  tour: { path: "/tours", crumb: "Tours" },
  package: { path: "/packages", crumb: "Packages" },
  park: { path: "/parks", crumb: "Parks" },
};

const mxn = (n: number) => `$${Math.round(n).toLocaleString("en-US")} MXN`;
const perPersonFrom = (p: CatalogPage) =>
  p.perPerson ?? (p.tiers.length ? Math.min(...p.tiers.map(([pax, total]) => Math.round(total / pax))) : null);
const perPersonHigh = (p: CatalogPage) =>
  p.tiers.length ? Math.max(...p.tiers.map(([pax, total]) => Math.round(total / pax))) : undefined;

function seoTitle(p: CatalogPage) {
  if (p.kind === "tour") return `${p.name} — Private Tour from Playa del Carmen`;
  if (p.kind === "package") return `${p.name} — Private Riviera Maya Vacation Package`;
  return `${p.name} — Ticket + Private Transport from Playa del Carmen`;
}

/** Questions answered only with facts already on the page. */
function faqsFor(p: CatalogPage): { q: string; a: string }[] {
  const listing = LISTING[p.kind].path;
  const priceList = p.tiers.map(([pax, total]) => `${pax} people: ${mxn(total)}`).join(" · ");
  const out: { q: string; a: string }[] = [];
  if (p.kind === "tour") {
    out.push({ q: `How long is the ${p.name} tour?`, a: `About ${p.dur.toLowerCase()}. Private round-trip pickup from your hotel or villa in Playa del Carmen and the Riviera Maya is included.` });
    if (priceList)
      out.push({ q: `How much does the private ${p.name} tour cost?`, a: `The price is for your whole group, not per person — the bigger the group, the less each person pays. ${priceList}.` });
    out.push({ q: "Is the tour private or shared?", a: "100% private: only your group, never combined with other travelers, with a private guide and private, air-conditioned transportation." });
  } else if (p.kind === "package") {
    if (p.includes.length) out.push({ q: `What's included in the ${p.name} package?`, a: `${p.includes.join(" · ")}.` });
    if (priceList)
      out.push({ q: `How much does the ${p.name} package cost?`, a: `The price is for your whole group, not per person: ${priceList}. Accommodation can be added when you book.` });
    if (p.weekNote) out.push({ q: "Can the order of the days change?", a: p.weekNote });
  } else {
    out.push({ q: `What's included when I book ${p.name} with Amanah Vacations?`, a: "Your park admission plus private round-trip transportation from your hotel or villa in Playa del Carmen and the Riviera Maya." });
    if (p.perPerson) out.push({ q: `How much does ${p.name} cost?`, a: `${mxn(p.perPerson)} per person, ticket and private transportation included.` });
  }
  if (p.kind !== "park")
    out.push({
      q: "Is it family-friendly and halal-friendly?",
      a: "Both. Our experiences are designed for families and all ages, and we regularly host Muslim travelers — halal dining and prayer arrangements can be added on request. See how our [halal-friendly private tours](/halal) work.",
    });
  out.push({
    q: "How do I book?",
    a: `Choose your date and group size on our [${LISTING[p.kind].crumb.toLowerCase()} page](${p.bookHref}) and pay securely online, or message us on WhatsApp and we'll arrange everything with you. Landing in Cancún? Add a [private airport transfer](/airport-transfers).`,
  });
  return out;
}

async function findPage(kind: CatalogKind, slug: string) {
  const all = await getCatalogPages(kind);
  const page = all.find((p) => p.slug === slug);
  return { all, page };
}

export async function catalogStaticParams(kind: CatalogKind) {
  return (await getCatalogPages(kind)).map((p) => ({ slug: p.slug }));
}

export async function catalogMetadata(kind: CatalogKind, slug: string, locale: string): Promise<Metadata> {
  const { page: p } = await findPage(kind, slug);
  if (!p) return {};
  const title = seoTitle(p);
  const description = clip(`${p.intro[0]} ${p.sub ? `${p.sub}.` : ""} Private, family-safe and halal-friendly, with hotel pickup.`);
  return localizeMetadata(locale, {
    title,
    description,
    openGraph: { type: "website", title, description, url: p.path, images: [p.img] },
    alternates: pageAlternates(locale, p.path),
  });
}

export default async function CatalogDetail({ kind, slug, locale: rawLocale }: { kind: CatalogKind; slug: string; locale: string }) {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [{ all, page: p }, contact] = await Promise.all([findPage(kind, slug), getContact()]);
  if (!p) notFound();
  const L = (href: string) => localizeHref(href, locale);
  const listing = LISTING[kind];
  const related = all.filter((x) => x.slug !== p.slug).slice(0, 4);
  const faqsEn = faqsFor(p);
  const from = perPersonFrom(p);
  const smallest = p.tiers[0];

  /* Translate everything in one pass (cached per string). */
  const eyebrow =
    kind === "tour" ? "Private tour from Playa del Carmen" : kind === "package" ? "Private vacation package · Riviera Maya" : "Park ticket + private transport";
  const labels = [
    eyebrow, "Duration", "From", "per person", "Hotel pickup", "Your group", "About this", kind === "tour" ? "tour" : kind === "package" ? "package" : "park",
    "Itinerary", "Day by day", "Included", "What's included", "A suggested week", "Price for your whole group", "people",
    "Book this " + (kind === "tour" ? "tour" : kind === "package" ? "package" : "park"), "Choose your date and group size on the next page.",
    "Ask us on WhatsApp", "Private · Family safe · Halal friendly", "On request — we arrange it personally with you.",
    "total for", "More", kind === "tour" ? "private tours" : kind === "package" ? "packages" : "parks", "View all →",
    "Home", listing.crumb, "Good to know", `${p.name} — your questions answered`, "100% private",
  ];
  const content = [
    p.name, p.sub, p.dur, ...p.intro,
    ...p.stops.flatMap((s) => [s.time, s.place, s.desc]),
    ...p.days.flatMap((d) => [d.title, d.dur, d.desc, d.included]),
    ...p.includes, ...p.week, p.weekNote,
    ...faqsEn.flatMap((f) => [f.q, f.a]),
    ...related.map((r) => r.name),
  ];
  const tr = await translateMany([...labels, ...content], locale);
  const [
    tEyebrow, tDuration, tFrom, tPerPerson, tPickup, tPrivate, tAbout, tKind, tItinerary, tDayByDay, tIncludedDay, tIncludes,
    tWeek, tGroupPrice, tPeople, tBook, tBookHint, tAsk, tTags, tOnReq, tTotalFor, tMore, tMoreKind, tViewAll,
    tHome, tCrumb, tFaqEyebrow, tFaqHeading, tOnlyYours,
  ] = tr;
  let i = labels.length;
  const name = tr[i++];
  const sub = tr[i++];
  const dur = tr[i++];
  const intro = p.intro.map(() => tr[i++]);
  const stops = p.stops.map(() => ({ time: tr[i++], place: tr[i++], desc: tr[i++] }));
  const days = p.days.map(() => ({ title: tr[i++], dur: tr[i++], desc: tr[i++], included: tr[i++] }));
  const includes = p.includes.map(() => tr[i++]);
  const week = p.week.map(() => tr[i++]);
  const weekNote = tr[i++];
  const faqs = faqsEn.map(() => ({ q: tr[i++], a: tr[i++] }));
  const relatedNames = related.map(() => tr[i++]);

  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hello Amanah Vacations! I have a question about ${p.name}.`)}`;
  const sectionLabel = "mb-4 flex items-center gap-2.5 border-b border-ink/15 pb-3 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta";

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: listing.crumb, path: listing.path },
            { name: p.name, path: p.path },
          ]),
          ...(from
            ? [productOfferSchema({ name: p.name, description: p.intro[0], image: p.img, url: p.path, priceMXN: from, highMXN: perPersonHigh(p) })]
            : []),
          faqSchema(faqs),
        ]}
      />

      {/* Hero: the photo, with the name set low on a dark fade */}
      <section className="relative h-[clamp(360px,62vh,640px)] overflow-hidden" style={p.imgContain ? { background: p.imgContain.bg } : undefined}>
        <Image
          src={p.img}
          alt={p.name}
          unoptimized={p.img.startsWith("/")}
          fill
          priority
          sizes="100vw"
          className={p.imgContain ? "object-contain px-[10%] pt-[72px] pb-[200px]" : "object-cover"}
        />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,26,16,0.86) 0%, rgba(10,26,16,0.35) 42%, transparent 70%)" }} />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1320px] px-5 pb-[clamp(24px,4vw,52px)] lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-3 text-[12px] text-white/75">
              <Link href={L("/")} className="hover:text-white">{tHome}</Link>
              <span aria-hidden className="mx-1.5">/</span>
              <Link href={L(listing.path)} className="hover:text-white">{tCrumb}</Link>
            </nav>
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">{tEyebrow}</div>
            <h1 className="max-w-[900px] font-serif text-[clamp(36px,5.2vw,72px)] font-semibold leading-[0.98] tracking-[-1px] text-white">
              {name}
            </h1>
            {sub && <p className="mt-3 max-w-[720px] text-[clamp(14px,1.2vw,17px)] leading-[1.55] text-white/85">{sub}</p>}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1320px] items-start gap-8 px-5 py-[clamp(32px,4.5vw,64px)] lg:grid-cols-[1.7fr_1fr] lg:gap-12 lg:px-8">
          <article className="min-w-0">
            {/* Key facts */}
            <dl className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-sand bg-sand sm:grid-cols-4">
              {[
                [tDuration, dur || "—"],
                [tFrom, from ? <><Price mxn={from} /> <span className="text-[12px] font-normal text-sage">{tPerPerson}</span></> : "—"],
                [tPickup, tIncludedDay],
                [tPrivate, tOnlyYours],
              ].map(([k, v], n) => (
                <div key={n} className="bg-white px-4 py-3.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-sage">{k}</dt>
                  <dd className="mt-1 font-serif text-[18px] font-semibold leading-tight text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className={sectionLabel}>{tAbout} {tKind}</h2>
            <div className="mb-12 space-y-4 text-[clamp(15px,1.1vw,17px)] leading-[1.85] text-ink/85">
              {intro.map((t, n) => <p key={n}>{t}</p>)}
            </div>

            {stops.length > 0 && (
              <>
                <h2 className={sectionLabel}>{tItinerary}</h2>
                <ol className="mb-12">
                  {stops.map((s, n) => (
                    <li key={n} className="relative flex gap-4 pb-6 last:pb-0">
                      {n < stops.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-sand" />}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-serif text-[15px] font-semibold text-white">{n + 1}</span>
                      <div className="pt-0.5">
                        <div className="text-[10.5px] font-semibold uppercase tracking-[2px] text-terracotta">{s.time}</div>
                        <div className="font-serif text-[21px] font-semibold leading-tight text-ink">{s.place}</div>
                        {s.desc && <p className="mt-1 text-[14.5px] leading-[1.7] text-ink/75">{s.desc}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {days.length > 0 && (
              <>
                <h2 className={sectionLabel}>{tDayByDay}</h2>
                <div className="mb-12 space-y-8">
                  {days.map((d, n) => (
                    <div key={n}>
                      <h3 className="font-serif text-[24px] font-semibold leading-tight text-ink">{d.title}</h3>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[2px] text-sage">{d.dur}</div>
                      <p className="mt-3 text-[15px] leading-[1.85] text-ink/80">{d.desc}</p>
                      {d.included && (
                        <p className="mt-2.5 text-[13px] leading-[1.6] text-forest">
                          <span className="font-semibold">{tIncludedDay}:</span> {d.included}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {includes.length > 0 && (
              <>
                <h2 className={sectionLabel}>{tIncludes}</h2>
                <ul className="mb-12 space-y-2.5">
                  {includes.map((t, n) => (
                    <li key={n} className="flex gap-3 text-[15px] leading-[1.6] text-ink/85">
                      <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {week.length > 0 && (
              <>
                <h2 className={sectionLabel}>{tWeek}</h2>
                <ol className="mb-3 grid gap-2 sm:grid-cols-2">
                  {week.map((w, n) => (
                    <li key={n} className="rounded-xl border border-sand bg-white px-4 py-3 text-[14px] leading-snug text-ink">
                      <span className="mr-2 font-serif text-[16px] font-semibold text-terracotta">{n + 1}</span>
                      {w}
                    </li>
                  ))}
                </ol>
                {weekNote && <p className="mb-12 text-[13px] italic leading-[1.6] text-sage">{weekNote}</p>}
              </>
            )}

            {p.tiers.length > 0 && (
              <>
                <h2 className={sectionLabel}>{tGroupPrice}</h2>
                <table className="w-full overflow-hidden rounded-[14px] border border-sand bg-white text-left">
                  <tbody>
                    {p.tiers.map(([pax, total]) => (
                      <tr key={pax} className="border-b border-sand last:border-0">
                        <th scope="row" className="px-4 py-3 text-[14px] font-medium text-ink">{pax} {tPeople}</th>
                        <td className="px-4 py-3 text-right font-serif text-[18px] font-semibold text-ink"><Price mxn={total} /></td>
                        <td className="hidden px-4 py-3 text-right text-[12.5px] text-sage sm:table-cell">
                          <Price mxn={Math.round(total / pax)} /> {tPerPerson}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </article>

          {/* Booking card — booking itself happens on the listing page */}
          <aside className="order-first overflow-hidden rounded-[22px] bg-white shadow-[0_24px_60px_rgba(10,26,16,0.12)] lg:order-none lg:sticky lg:top-[108px]">
            <div className="bg-night px-6 py-6 text-white">
              {p.onRequest ? (
                <p className="font-serif text-[20px] font-semibold leading-snug">{tOnReq}</p>
              ) : (
                <>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">{tFrom}</div>
                  <div className="mt-1 font-serif text-[38px] font-semibold leading-none">{from ? <Price mxn={from} /> : "—"}</div>
                  <div className="mt-1 text-[13px] text-white/70">
                    {tPerPerson}
                    {smallest && <> · <Price mxn={smallest[1]} /> {tTotalFor} {smallest[0]} {tPeople}</>}
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2.5 px-6 py-6">
              <Link
                href={L(p.onRequest ? "/contact" : p.bookHref)}
                className="flex items-center justify-between rounded-full bg-gradient-to-br from-terracotta to-gold px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                {tBook}
                <span aria-hidden>→</span>
              </Link>
              {!p.onRequest && <p className="px-1 text-[12px] text-sage">{tBookHint}</p>}
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full border-[1.5px] border-forest px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-forest transition hover:bg-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                {tAsk}
                <span aria-hidden>→</span>
              </a>
              <p className="pt-2 text-center font-serif text-[16px] italic text-ink/80">{tTags}</p>
            </div>
          </aside>
        </div>
      </section>

      <Faq items={faqs} heading={tFaqHeading} eyebrow={tFaqEyebrow} />

      {related.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,2.6vw,34px)] font-semibold text-ink">
                {tMore} <em className="italic text-forest">{tMoreKind}</em>
              </h2>
              <Link href={L(listing.path)} className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white">
                {tViewAll}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
              {related.map((r, n) => (
                <Link
                  key={r.slug}
                  href={L(r.path)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-[18px] transition-transform duration-500 ease-out hover:scale-[1.03]"
                  style={r.imgContain ? { background: r.imgContain.bg } : undefined}
                >
                  <Image
                    src={r.img}
                    alt=""
                    unoptimized={r.img.startsWith("/")}
                    fill
                    sizes="(max-width: 768px) 50vw, 320px"
                    className={r.imgContain ? "object-contain p-[12%] pb-[40%]" : "object-cover"}
                  />
                  <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,26,16,0.85) 0%, rgba(10,26,16,0.2) 50%, transparent 70%)" }} />
                  <h3 className="absolute inset-x-0 bottom-0 p-4 font-serif text-[clamp(16px,1.5vw,20px)] font-semibold leading-[1.05] text-white">
                    {relatedNames[n]}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESTINATIONS, getDestination } from "@/data/destinations";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return {};
  return {
    title: `${dest.title} | Riviera Maya Activities`,
    description: dest.paragraphs[0]?.slice(0, 155),
    openGraph: { images: [dest.hero] },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const others = DESTINATIONS.filter((d) => d.slug !== dest.slug).slice(0, 4);

  return (
    <main className="bg-cream">
      {/* Hero */}
      <section className="relative flex min-h-[52vh] items-end overflow-hidden md:min-h-[62vh]">
        <Image
          src={dest.hero}
          alt={dest.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,16,0.85) 0%, rgba(10,26,16,0.35) 45%, rgba(10,26,16,0.15) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-[clamp(28px,4vw,56px)] pt-24 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-white/60">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <Link href="/activities" className="transition hover:text-white">
              Activities
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="text-gold">{dest.title}</span>
          </nav>
          <h1 className="font-serif text-[clamp(38px,5.5vw,68px)] font-semibold leading-[1.0] tracking-[-1px] text-white">
            {dest.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid max-w-[1320px] gap-[clamp(32px,4vw,64px)] px-5 py-[clamp(44px,5vw,80px)] lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <article>
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            The Experience
          </div>
          <div className="space-y-5 text-[clamp(14px,1.05vw,16px)] leading-[1.85] text-ink/80">
            {dest.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          {dest.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {dest.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-sand bg-white px-3.5 py-1.5 text-[12px] font-medium text-forest"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-[108px] lg:self-start">
          <div className="rounded-[22px] border border-sand bg-white p-[clamp(22px,2vw,30px)] shadow-[0_18px_44px_rgba(28,43,30,0.08)]">
            <h2 className="font-serif text-[clamp(21px,1.9vw,26px)] font-semibold leading-tight text-ink">
              Ready to live <em className="italic text-forest">this?</em>
            </h2>
            <p className="mt-2.5 text-[13px] leading-[1.7] text-sage">
              Private experience, planned around your dates, your pace and your
              family — with trusted guides and transparent prices.
            </p>
            <div className="mt-5 space-y-2.5">
              <Link
                href="/contact"
                className="block rounded-full bg-gradient-to-br from-terracotta to-gold py-3 text-center text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
              >
                Contact Us to Book It →
              </Link>
              <Link
                href="/packages"
                className="block rounded-full border-[1.5px] border-forest py-3 text-center text-[14px] font-medium text-forest transition hover:bg-forest hover:text-white"
              >
                Check Our Packages
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-sand pt-4">
              {["🔒 Private", "👨‍👩‍👧 Family Safe", "🕌 Halal Friendly"].map(
                (b) => (
                  <span
                    key={b}
                    className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-medium text-forest"
                  >
                    {b}
                  </span>
                )
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* More activities */}
      <section className="mx-auto max-w-[1320px] px-5 pb-[clamp(44px,5vw,80px)] lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,2.6vw,34px)] font-semibold text-ink">
            More <em className="italic text-forest">experiences</em>
          </h2>
          <Link
            href="/activities"
            className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
          {others.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-[18px]"
            >
              <Image
                src={d.card}
                alt={d.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,26,16,0.82) 0%, rgba(10,26,16,0.25) 45%, transparent 70%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-serif text-[clamp(16px,1.5vw,20px)] font-semibold leading-[1.05] text-white">
                  {d.title}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-gold">
                  Explore <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

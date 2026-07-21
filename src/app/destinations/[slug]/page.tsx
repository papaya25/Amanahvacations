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
  const idx = DESTINATIONS.findIndex((d) => d.slug === dest.slug);
  const next = DESTINATIONS[(idx + 1) % DESTINATIONS.length];

  return (
    <main>
      {/* Full-page background image with floating cards — original design */}
      <section className="relative overflow-hidden">
        <Image
          src={dest.hero}
          alt={dest.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-night/15" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1320px] items-start gap-6 px-5 py-[clamp(28px,4vw,64px)] lg:grid-cols-[1.7fr_1fr] lg:gap-8 lg:px-8">
          {/* White content card */}
          <article className="overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(10,26,16,0.25)]">
            <div className="bg-cream/80 px-[clamp(22px,2.5vw,40px)] py-[clamp(18px,2vw,30px)]">
              <h1 className="font-serif text-[clamp(32px,4vw,54px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
                {dest.title}
              </h1>
            </div>
            <div className="bg-white/55 px-[clamp(22px,2.5vw,40px)] py-[clamp(24px,2.5vw,36px)] backdrop-blur-[2px]">
              <div className="mb-4 flex items-center gap-2.5 border-b border-ink/15 pb-3 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
                Description
              </div>
              <div className="space-y-4 text-[clamp(14px,1.05vw,15.5px)] leading-[1.85] text-ink/85">
                {dest.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </article>

          {/* Side booking card */}
          <aside className="overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(10,26,16,0.25)] lg:sticky lg:top-[108px]">
            {/* Barcode strip */}
            <div className="flex items-center justify-center bg-gradient-to-br from-gold to-terracotta px-6 py-7">
              <div
                aria-hidden
                className="h-14 w-44 opacity-90"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #1C2B1E 0 2px, transparent 2px 5px, #1C2B1E 5px 9px, transparent 9px 11px, #1C2B1E 11px 12px, transparent 12px 16px)",
                }}
              />
            </div>
            <div className="bg-cream/80 px-6 py-6">
              <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
                Amanah Vacations
              </div>
              <p className="mb-5 font-serif text-[19px] font-semibold italic leading-snug text-ink">
                Private · Family Safe · Halal Friendly
              </p>
              <div className="space-y-2.5">
                <Link
                  href="/contact"
                  className="flex items-center justify-between rounded-full bg-ink px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-white transition hover:bg-forest"
                >
                  Contact Us to Book It
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/packages"
                  className="flex items-center justify-between rounded-full bg-gradient-to-br from-terracotta to-gold px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[1px] text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
                >
                  Check Our Packages
                  <span aria-hidden>←</span>
                </Link>
              </div>
            </div>

            {/* Next activity */}
            <div className="flex justify-end bg-cream/80 px-6 pb-5">
              <Link
                href={`/destinations/${next.slug}`}
                className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1.5px] text-forest transition hover:text-terracotta"
              >
                Next · {next.title}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* More activities */}
      <section className="bg-cream">
        <div className="mx-auto max-w-[1320px] px-5 py-[clamp(40px,5vw,72px)] lg:px-8">
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
                className="group relative aspect-[3/4] overflow-hidden rounded-[18px] transition-transform duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_18px_44px_rgba(28,43,30,0.18)]"
              >
                <Image
                  src={d.card}
                  alt={d.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
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
        </div>
      </section>
    </main>
  );
}

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
    <main>
      {/* Full-page background image with content on top — original design */}
      <section className="relative flex min-h-[calc(100svh-84px)] items-center overflow-hidden">
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
              "linear-gradient(to right, rgba(10,26,16,0.78) 0%, rgba(10,26,16,0.55) 45%, rgba(10,26,16,0.25) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background: "linear-gradient(to top, rgba(10,26,16,0.6), transparent)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-[clamp(48px,7vw,96px)] lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 text-[12px] text-white/60">
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

          <h1 className="max-w-[720px] font-serif text-[clamp(40px,5.5vw,72px)] font-semibold leading-[0.98] tracking-[-1px] text-white">
            {dest.title}
          </h1>

          <div className="mt-7 mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-gold">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-gold" />
            Description
          </div>
          <div className="max-w-[680px] space-y-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.85] text-white/85">
            {dest.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3.5 text-center text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              Contact Us to Book It →
            </Link>
            <Link
              href="/packages"
              className="rounded-full border-[1.5px] border-white/60 px-6 py-3.5 text-center text-[14px] font-medium text-white transition hover:border-white hover:bg-white hover:text-ink"
            >
              Check Our Packages
            </Link>
          </div>
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

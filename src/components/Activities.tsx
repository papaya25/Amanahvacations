import Image from "next/image";
import Link from "next/link";
import { getEffectiveDestinations } from "@/lib/content/activities";

// Featured on the homepage — sourced from the live destinations list so the
// links always resolve to existing, visible pages (no drift / 404s). Hidden
// featured slugs are replaced by the next visible destinations.
const FEATURED = ["whaleshark", "coba", "cenotes", "siankaan", "holbox", "zipline", "xcaret", "chichenitza"];

export default async function Activities() {
  const all = await getEffectiveDestinations();
  const featured = FEATURED.map((slug) => all.find((x) => x.slug === slug)).filter(
    (d): d is NonNullable<typeof d> => Boolean(d)
  );
  const fillers = all.filter((d) => !FEATURED.includes(d.slug));
  const ACTIVITIES = [...featured, ...fillers]
    .slice(0, 8)
    .map((d) => ({ title: d.title, href: `/destinations/${d.slug}`, img: d.card, alt: d.alt }));
  return (
    <section className="bg-cream py-[clamp(56px,7vw,96px)]" aria-labelledby="activities-heading">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        <div className="mb-[clamp(28px,3.5vw,48px)] flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
              <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
              Handpicked Experiences
            </div>
            <h2
              id="activities-heading"
              className="font-serif text-[clamp(32px,3.6vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink"
            >
              Explore <em className="italic text-forest">Activities</em>
            </h2>
          </div>
          <Link
            href="/activities"
            className="whitespace-nowrap rounded-full border-[1.5px] border-forest px-5 py-2.5 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
          >
            Explore All Activities →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
          {ACTIVITIES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-[18px] transition-transform duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_18px_44px_rgba(28,43,30,0.18)]"
            >
              <Image
                src={a.img}
                alt={a.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,26,16,0.82) 0%, rgba(10,26,16,0.25) 45%, transparent 70%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-[clamp(14px,1.6vw,22px)]">
                <h3 className="font-serif text-[clamp(17px,1.7vw,23px)] font-semibold leading-[1.05] text-white">
                  {a.title}
                </h3>
                <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[2px] text-gold transition-all duration-300 group-hover:gap-2.5">
                  Explore
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

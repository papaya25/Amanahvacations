import Image from "next/image";
import Link from "next/link";

export default function DreamAdventure() {
  return (
    <section className="bg-cream py-[clamp(56px,7vw,96px)]" aria-labelledby="dream-heading">
      <div className="mx-auto grid max-w-[1320px] items-center gap-[clamp(32px,4vw,72px)] px-5 md:grid-cols-2 lg:px-8">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-[24px] md:order-1 md:aspect-[4/4.6]">
          <Image
            src="/images/dream-adventure.jpg"
            alt="Turquoise Caribbean coastline of the Riviera Maya"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10,26,16,0.25), transparent 45%)",
            }}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[11px] font-medium uppercase tracking-[2px] text-white backdrop-blur-md">
            Riviera Maya · Mexico
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="mb-3 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            Almost There
          </div>
          <h2
            id="dream-heading"
            className="mb-5 font-serif text-[clamp(30px,3.4vw,46px)] font-semibold leading-[1.05] tracking-[-1px] text-ink"
          >
            Your dream adventure is{" "}
            <em className="italic text-forest">just around the corner</em>
          </h2>
          <div className="space-y-4 text-[clamp(13.5px,1.05vw,15.5px)] leading-[1.8] text-sage">
            <p>
              Your dream adventure in the Riviera Maya is just around the
              corner, where lush jungle paths lead to hidden cenotes, turquoise
              waters stretch endlessly, and every moment is filled with
              excitement.
            </p>
            <p>
              From soaring above the treetops on ziplines to exploring rugged
              trails on ATVs, and unwinding on some of the Caribbean&rsquo;s
              most breathtaking beaches, this is more than a destination —
              it&rsquo;s an experience waiting to be lived.
            </p>
            <p>
              With Amanah Vacations, every detail is thoughtfully crafted to
              give you a seamless, authentic, and unforgettable journey, so you
              can focus on what truly matters: creating memories that last a
              lifetime.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/packages"
              className="inline-block rounded-full bg-gradient-to-br from-terracotta to-gold px-7 py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(200,105,58,0.42)]"
            >
              Plan Your Trip →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

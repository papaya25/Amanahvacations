import Image from "next/image";
import Link from "next/link";

const EXPLORE = [
  { label: "Home", href: "/" },
  { label: "Activities", href: "/activities" },
  { label: "Packages", href: "/packages" },
  { label: "Tours", href: "/tours" },
  { label: "VIP", href: "/vip" },
  { label: "About", href: "/aboutus" },
];

const SUPPORT = [
  { label: "Contact", href: "/contact" },
  { label: "Halal Friendly Options", href: "/halal" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Liability Waiver", href: "/liability-waiver" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/amanahvacations/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591849591722",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.3V11H9v3h2.3v7h2.2Z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v2.7c-1.5.1-2.8-.4-3.9-1.2v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .7 0 1 .1v2.9a2.7 2.7 0 1 0 1.9 2.6V3h2.7Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="mx-auto max-w-[1320px] px-5 py-[clamp(48px,5vw,72px)] lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Amanah Vacations — Home">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream p-1.5">
                <Image src="/images/logo.png" alt="" width={44} height={46} />
              </span>
              <span className="leading-none">
                <span className="block font-serif text-[22px] font-semibold tracking-wide">
                  AMANAH
                </span>
                <span className="block text-[10.5px] font-medium uppercase tracking-[3px] text-gold">
                  Vacations
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-[320px] text-[13.5px] leading-[1.75] text-white/55">
              Trust in Adventure. Private tours, hidden cenotes and Caribbean
              beaches in the Riviera Maya — curated for families and couples,
              halal-friendly on request.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-gold">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support & legal">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[2.5px] text-gold">
              Support
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-[clamp(36px,4vw,56px)] flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12.5px] text-white/45 sm:flex-row">
          <span>Amanah Vacations © {new Date().getFullYear()} All Rights Reserved</span>
          <span className="font-serif text-[15px] italic text-white/35">
            Trust in Adventure · أمانة
          </span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CONTACT, type ContactInfo } from "@/lib/content/contact";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

const EXPLORE_KEYS = [
  { key: "nav_home", href: "/" },
  { key: "nav_activities", href: "/activities" },
  { key: "nav_packages", href: "/packages" },
  { key: "nav_tours", href: "/tours" },
  { key: "nav_vip", href: "/vip" },
  { key: "nav_about", href: "/aboutus" },
] as const;

const SUPPORT_KEYS = [
  { key: "nav_contact", href: "/contact" },
  { key: "footer_airport_transfers", href: "/airport-transfers" },
  { key: "footer_halal", href: "/halal" },
  { key: "footer_terms", href: "/terms-and-conditions" },
  { key: "footer_privacy", href: "/privacy-policy" },
  { key: "footer_waiver", href: "/liability-waiver" },
] as const;

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.3V11H9v3h2.3v7h2.2Z" />
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v2.7c-1.5.1-2.8-.4-3.9-1.2v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .7 0 1 .1v2.9a2.7 2.7 0 1 0 1.9 2.6V3h2.7Z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12ZM9.8 15.3V8.7l6.2 3.3-6.2 3.3Z" />
    </svg>
  ),
};

export default function Footer({ contact = DEFAULT_CONTACT }: { contact?: ContactInfo }) {
  const { locale, dict } = useI18n();
  const EXPLORE = EXPLORE_KEYS.map((item) => ({ label: dict[item.key], href: localizeHref(item.href, locale) }));
  const SUPPORT = SUPPORT_KEYS.map((item) => ({ label: dict[item.key], href: localizeHref(item.href, locale) }));
  const socials = ([
    ["Instagram", contact.instagram, SOCIAL_ICONS.instagram],
    ["Facebook", contact.facebook, SOCIAL_ICONS.facebook],
    ["TikTok", contact.tiktok, SOCIAL_ICONS.tiktok],
    ["YouTube", contact.youtube, SOCIAL_ICONS.youtube],
  ] as const).filter(([, href]) => href && href !== "#");

  return (
    <footer className="bg-night text-white">
      <div className="mx-auto max-w-[1320px] px-5 py-8 md:py-[clamp(48px,5vw,72px)] lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 flex flex-col items-center text-center md:col-span-1 md:items-start md:text-left">
            <Link href={localizeHref("/", locale)} className="flex items-center gap-3" aria-label="Amanah Vacations — Home">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream p-1 md:h-14 md:w-14 md:rounded-2xl md:p-1.5">
                <Image src="/images/logo.png" alt="" width={44} height={46} />
              </span>
              <span className="leading-none">
                <span className="block font-serif text-[19px] font-semibold tracking-wide md:text-[22px]">
                  AMANAH
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-[3px] text-gold md:text-[10.5px]">
                  Vacations
                </span>
              </span>
            </Link>
            <p className="mt-4 hidden max-w-[320px] text-[13.5px] leading-[1.75] text-white/55 md:block">
              {dict.footer_brand_desc}
            </p>
            <div className="mt-4 flex gap-2.5 md:mt-6">
              {socials.map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold md:h-10 md:w-10"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[2.5px] text-gold md:mb-4 md:text-[11px]">
              {dict.footer_explore}
            </h3>
            <ul className="space-y-2 md:space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-white/70 transition hover:text-white md:text-[14px]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support & legal">
            <h3 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[2.5px] text-gold md:mb-4 md:text-[11px]">
              {dict.footer_support}
            </h3>
            <ul className="space-y-2 md:space-y-2.5">
              {SUPPORT.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-white/70 transition hover:text-white md:text-[14px]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-[11.5px] text-white/45 sm:flex-row md:mt-[clamp(36px,4vw,56px)] md:pt-6 md:text-[12.5px]">
          <span>Amanah Vacations © {new Date().getFullYear()} {dict.footer_rights}</span>
          <span className="font-serif text-[14px] italic text-white/35 md:text-[15px]">
            {dict.footer_tagline} · أمانة
          </span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/browser";
import { CURRENCIES, SYMBOLS, useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS, localizeHref, stripLocale, type Locale } from "@/lib/i18n/config";

/* "Activities" is deliberately NOT in the menu: /activities is a regional
   discovery guide (kept for SEO + the homepage section), not a bookable
   catalog — having it next to Packages/Tours made visitors try to book
   from it. It stays linked from the homepage section and the footer. */
const NAV_KEYS = [
  { key: "nav_home", href: "/" },
  { key: "nav_packages", href: "/packages" },
  { key: "nav_tours", href: "/tours" },
  { key: "nav_vip", href: "/vip" },
  { key: "nav_about", href: "/aboutus" },
  { key: "nav_contact", href: "/contact" },
] as const;

const LANGUAGES = LOCALES.map((code) => ({ code, ...LOCALE_LABELS[code] }));

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);
  return ref;
}

export default function Header() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const lang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const switchLocale = (next: Locale) => router.push(localizeHref(stripLocale(pathname), next));
  const NAV = NAV_KEYS.map((item) => ({ label: dict[item.key], href: localizeHref(item.href, locale) }));
  const withLocale = (href: string) => localizeHref(href, locale);

  const { currency, setCurrency } = useCurrency();
  const [openMenu, setOpenMenu] = useState<"lang" | "currency" | "account" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  /* Logged-in customer (null = guest). Kept in sync with Supabase auth so the
     button flips between "Log In" and the account menu without a reload. */
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const firstName =
    ((user?.user_metadata?.name as string) || user?.email || "")
      .split(" ")[0]
      .split("@")[0] || "";

  const ACCOUNT_LINKS = [
    { label: dict.acctnav_orders, href: "/account/orders" },
    { label: dict.acctnav_profile, href: "/account/profile" },
    { label: dict.acctnav_settings, href: "/account/settings" },
    { label: dict.acctnav_preferences, href: "/account/preferences" },
  ] as const;

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpenMenu(null);
    setMobileOpen(false);
    router.push(withLocale("/"));
    router.refresh();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dropdownRef = useOutsideClose(() => setOpenMenu(null));

  return (
    <>
    <header
      className={`sticky top-0 z-50 border-b transition-shadow ${
        scrolled ? "border-sand shadow-[0_4px_24px_rgba(28,43,30,0.08)]" : "border-transparent"
      } bg-cream/92 backdrop-blur-md`}
    >
      <div className="mx-auto flex h-[84px] max-w-[1320px] items-center gap-6 px-5 lg:px-8">
        {/* Logo */}
        <Link href={withLocale("/")} className="flex shrink-0 items-center gap-3" aria-label="Amanah Vacations — Home">
          <Image
            src="/images/logo.png"
            alt="Amanah Vacations logo"
            width={62}
            height={64}
            priority
          />
          <span className="hidden sm:block leading-none">
            <span className="block font-serif text-[23px] font-semibold tracking-wide text-ink">
              AMANAH
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[3.5px] text-terracotta">
              Vacations
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium text-ink/80 transition hover:bg-forest/8 hover:text-forest"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div ref={dropdownRef} className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* Language */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpenMenu(openMenu === "lang" ? null : "lang")}
              className="flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-2 text-[13px] font-medium text-ink transition hover:border-forest"
              aria-haspopup="listbox"
              aria-expanded={openMenu === "lang"}
            >
              <span aria-hidden>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
              <Chevron open={openMenu === "lang"} />
            </button>
            {openMenu === "lang" && (
              <ul
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] w-40 overflow-hidden rounded-2xl border border-sand bg-white py-1.5 shadow-[0_16px_40px_rgba(28,43,30,0.14)]"
              >
                {LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => {
                        switchLocale(l.code);
                        setOpenMenu(null);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] transition hover:bg-cream ${
                        l.code === lang.code ? "font-semibold text-forest" : "text-ink"
                      }`}
                    >
                      <span aria-hidden>{l.flag}</span> {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Currency */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpenMenu(openMenu === "currency" ? null : "currency")}
              className="flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-2 text-[13px] font-medium text-ink transition hover:border-forest"
              aria-haspopup="listbox"
              aria-expanded={openMenu === "currency"}
            >
              {currency}
              <Chevron open={openMenu === "currency"} />
            </button>
            {openMenu === "currency" && (
              <ul
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] w-32 overflow-hidden rounded-2xl border border-sand bg-white py-1.5 shadow-[0_16px_40px_rgba(28,43,30,0.14)]"
              >
                {CURRENCIES.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => {
                        setCurrency(c);
                        setOpenMenu(null);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-[13px] transition hover:bg-cream ${
                        c === currency ? "font-semibold text-forest" : "text-ink"
                      }`}
                    >
                      {c} <span className="text-sage">{SYMBOLS[c]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Log in / account menu */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
                className="flex items-center gap-2 rounded-full border-[1.5px] border-forest py-[5px] pl-[6px] pr-3 text-[13px] font-semibold text-forest transition hover:bg-forest/5"
                aria-haspopup="menu"
                aria-expanded={openMenu === "account"}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[12px] font-bold uppercase text-white">
                  {firstName.charAt(0) || "A"}
                </span>
                <span className="max-w-[110px] truncate">{firstName}</span>
                <Chevron open={openMenu === "account"} />
              </button>
              {openMenu === "account" && (
                <ul
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-2xl border border-sand bg-white py-1.5 shadow-[0_16px_40px_rgba(28,43,30,0.14)]"
                >
                  {ACCOUNT_LINKS.map((item) => (
                    <li key={item.href} role="none">
                      <Link
                        role="menuitem"
                        href={withLocale(item.href)}
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2 text-[13px] text-ink transition hover:bg-cream"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li role="none" className="mt-1 border-t border-sand pt-1">
                    <button
                      role="menuitem"
                      onClick={logout}
                      className="block w-full px-4 py-2 text-left text-[13px] font-semibold text-terracotta transition hover:bg-cream"
                    >
                      {dict.acct_logout}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link
              href={withLocale("/login")}
              className="hidden items-center gap-1.5 rounded-full border-[1.5px] border-forest px-4 py-[7px] text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white md:flex"
            >
              {dict.login}
            </Link>
          )}

          {/* Cart */}
          <Link
            href={withLocale("/cart")}
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white transition hover:bg-ink"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white text-ink lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

    </header>

      {/* Mobile drawer — outside <header> so its backdrop-filter can't clip the fixed overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[300px] flex-col bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-sand px-5 py-4">
              <span className="font-serif text-lg font-semibold">{dict.menu}</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-sand bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col px-3 py-3" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink transition hover:bg-forest/8"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3 border-t border-sand px-5 py-5">
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => switchLocale(l.code)}
                    aria-label={l.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white text-[15px] transition ${
                      l.code === lang.code ? "border-forest shadow-[0_2px_10px_rgba(58,90,60,0.2)]" : "border-sand"
                    }`}
                  >
                    <span aria-hidden>{l.flag}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                      c === currency
                        ? "border-forest bg-forest text-white"
                        : "border-sand bg-white text-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-1 pb-1 text-[13px] font-semibold text-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[12px] font-bold uppercase text-white">
                      {firstName.charAt(0) || "A"}
                    </span>
                    <span className="truncate">{firstName}</span>
                  </div>
                  {ACCOUNT_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={withLocale(item.href)}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-3 py-2 text-[13.5px] font-medium text-ink transition hover:bg-forest/8"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={logout}
                    className="block w-full rounded-full border-[1.5px] border-terracotta py-2.5 text-center text-[14px] font-semibold text-terracotta"
                  >
                    {dict.acct_logout}
                  </button>
                </div>
              ) : (
                <Link
                  href={withLocale("/login")}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-full border-[1.5px] border-forest py-2.5 text-center text-[14px] font-semibold text-forest"
                >
                  {dict.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

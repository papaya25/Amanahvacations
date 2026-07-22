"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Activities", href: "/activities" },
  { label: "Packages", href: "/packages" },
  { label: "Tours", href: "/tours" },
  { label: "VIP", href: "/vip" },
  { label: "About", href: "/aboutus" },
  { label: "Contact", href: "/contact" },
];

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇲🇽", label: "Español" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "MXN", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

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
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [openMenu, setOpenMenu] = useState<"lang" | "currency" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

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
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Amanah Vacations — Home">
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
                        setLang(l);
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
              {currency.code}
              <Chevron open={openMenu === "currency"} />
            </button>
            {openMenu === "currency" && (
              <ul
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] w-32 overflow-hidden rounded-2xl border border-sand bg-white py-1.5 shadow-[0_16px_40px_rgba(28,43,30,0.14)]"
              >
                {CURRENCIES.map((c) => (
                  <li key={c.code}>
                    <button
                      onClick={() => {
                        setCurrency(c);
                        setOpenMenu(null);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-[13px] transition hover:bg-cream ${
                        c.code === currency.code ? "font-semibold text-forest" : "text-ink"
                      }`}
                    >
                      {c.code} <span className="text-sage">{c.symbol}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Log in */}
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-full border-[1.5px] border-forest px-4 py-[7px] text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white md:flex"
          >
            Log In
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
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
              <span className="font-serif text-lg font-semibold">Menu</span>
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
                    onClick={() => setLang(l)}
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
                    key={c.code}
                    onClick={() => setCurrency(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                      c.code === currency.code
                        ? "border-forest bg-forest text-white"
                        : "border-sand bg-white text-ink"
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-full border-[1.5px] border-forest py-2.5 text-center text-[14px] font-semibold text-forest"
              >
                Log In
              </Link>
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

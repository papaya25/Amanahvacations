"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    heading: "Content",
    links: [
      { href: "/admin/hero", label: "Hero & Home" },
      { href: "/admin/packages", label: "Packages" },
      { href: "/admin/tours", label: "Tours" },
      { href: "/admin/activities", label: "Activities" },
      { href: "/admin/addons", label: "Add-ons" },
      { href: "/admin/about", label: "About Page" },
      { href: "/admin/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Commerce",
    links: [
      { href: "/admin/promos", label: "Promo Codes" },
      { href: "/admin/currency", label: "Currency & Rates" },
      { href: "/admin/transfers", label: "Airport Transfers" },
      { href: "/admin/costs", label: "Costs" },
    ],
  },
  {
    heading: "Business",
    links: [
      { href: "/admin/contact", label: "Contact & Social" },
      { href: "/admin/emails", label: "Emails" },
      { href: "/admin/legal", label: "Legal Pages" },
    ],
  },
];

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.heading}>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-white/40">
            {g.heading}
          </div>
          <div className="space-y-0.5">
            {g.links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onNavigate}
                  className={`block rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${
                    active
                      ? "bg-gold/20 text-gold"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

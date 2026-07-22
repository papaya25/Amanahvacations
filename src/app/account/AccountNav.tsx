"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/settings", label: "Account Settings" },
  { href: "/account/preferences", label: "Preferences" },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-xl px-4 py-3 text-[14px] font-medium transition ${
              active
                ? "bg-forest text-white"
                : "text-ink/80 hover:bg-forest/8 hover:text-forest"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <button
        onClick={() =>
          alert("You'll be able to log out once accounts are connected in the next phase.")
        }
        className="whitespace-nowrap rounded-xl px-4 py-3 text-left text-[14px] font-medium text-sage transition hover:text-terracotta"
      >
        Log Out
      </button>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref, stripLocale } from "@/lib/i18n/config";

const LINKS = [
  { href: "/account/orders", key: "acctnav_orders" },
  { href: "/account/profile", key: "acctnav_profile" },
  { href: "/account/settings", key: "acctnav_settings" },
  { href: "/account/preferences", key: "acctnav_preferences" },
] as const;

export default function AccountNav() {
  const pathname = usePathname();
  const current = stripLocale(pathname);
  const { locale, dict } = useI18n();
  return (
    <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
      {LINKS.map((l) => {
        const active = current === l.href;
        return (
          <Link
            key={l.href}
            href={localizeHref(l.href, locale)}
            className={`whitespace-nowrap rounded-xl px-4 py-3 text-[14px] font-medium transition ${
              active
                ? "bg-forest text-white"
                : "text-ink/80 hover:bg-forest/8 hover:text-forest"
            }`}
          >
            {dict[l.key]}
          </Link>
        );
      })}
    </nav>
  );
}

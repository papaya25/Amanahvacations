"use client";

/* Tab-style links switching between the Private Tours and Parks pages.
   Rendered under the page header on both pages; styles live in tours.css. */

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { localizeHref } from "@/lib/i18n/config";

export default function TourParkTabs({ active }: { active: "tours" | "parks" }) {
  const { locale, dict } = useI18n();
  return (
    <div className="at-tabs" role="tablist">
      <Link
        href={localizeHref("/tours", locale)}
        className={`at-tab${active === "tours" ? " active" : ""}`}
        aria-current={active === "tours" ? "page" : undefined}
      >
        {dict.tp_tab_tours}
      </Link>
      <Link
        href={localizeHref("/parks", locale)}
        className={`at-tab${active === "parks" ? " active" : ""}`}
        aria-current={active === "parks" ? "page" : undefined}
      >
        {dict.tp_tab_parks}
      </Link>
    </div>
  );
}

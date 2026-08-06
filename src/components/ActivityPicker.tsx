"use client";

/* Shared grouped activity picker — used by the packages page's "Build Your
   Own Plan" and the tours page's single-activity booking. Renders the add-on
   catalogue under collapsible category headers (Tours & Parks open, Special
   Touches and On Request collapsed), with live per-person rates for the
   current group size. Selection state lives in the parent. */

import { useState } from "react";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { ADDON_CATEGORY, type Activity } from "@/app/(public)/[locale]/packages/data";
import { tourTotalFor } from "@/app/(public)/[locale]/tours/data";
import "./activity-picker.css";

/** What this activity costs for a group of `people` when bought directly —
    tiered tour-type activities charge the group total once, flat ones charge
    per person. Null = not directly bookable (on request / booked via contact).
    Mirrors the server's getActivityLineTotal exactly. */
export function activityChargeTotal(act: Activity, people: number): number | null {
  const n = Math.max(1, people);
  if (act.groupPrices) return tourTotalFor(act, n);
  if (act.inCart && act.price !== null && act.price > 0) return act.price * n;
  return null;
}

export default function ActivityPicker({
  activities,
  selected,
  onToggle,
  people,
}: {
  activities: Activity[];
  /** Selected activity NAMES (display names, as stored in cart details). */
  selected: string[];
  onToggle: (name: string) => void;
  people: number;
}) {
  const { format } = useCurrency();
  const { dict } = useI18n();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    tours: true,
    parks: true,
    special: false,
    onreq: false,
  });

  const groups = [
    { key: "tours", label: dict.pkgc_cat_tours, items: [] as Activity[] },
    { key: "parks", label: dict.pkgc_cat_parks, items: [] as Activity[] },
    { key: "special", label: dict.pkgc_cat_special, items: [] as Activity[] },
    { key: "onreq", label: dict.pkgc_cat_onreq, items: [] as Activity[] },
  ];
  activities.forEach((act) => {
    const key = act.price === null ? "onreq" : ADDON_CATEGORY[act.id] ?? "special";
    groups.find((g) => g.key === key)!.items.push(act);
  });

  const n = Math.max(1, people);

  return (
    <div className="apk">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => {
          const open = !!openCats[g.key];
          return (
            <div key={g.key} className="apk-cat">
              <button
                type="button"
                className="apk-cat-header"
                aria-expanded={open}
                onClick={() => setOpenCats((p) => ({ ...p, [g.key]: !p[g.key] }))}
              >
                <span>
                  {g.label} ({g.items.length})
                </span>
                <span className={`apk-chev${open ? " open" : ""}`} aria-hidden>
                  ▾
                </span>
              </button>
              {open &&
                g.items.map((act) => {
                  const sel = selected.includes(act.name);
                  const total = activityChargeTotal(act, n);
                  return (
                    <div
                      key={act.id}
                      className={`apk-item${sel ? " selected" : ""}`}
                      onClick={() => onToggle(act.name)}
                    >
                      <div className="apk-cb">{sel ? "✓" : ""}</div>
                      <span className="apk-name">
                        {act.emoji} {act.name}{" "}
                        <span
                          className="apk-info"
                          data-tip={act.desc}
                          onClick={(e) => e.stopPropagation()}
                        >
                          i
                        </span>
                      </span>
                      {total !== null ? (
                        <span className="apk-price">
                          {act.groupPrices
                            ? `${format(Math.round(total / n))}${dict.pkgc_per_person}`
                            : `${format(act.price as number)}${act.unit}`}
                        </span>
                      ) : act.price !== null ? (
                        <>
                          <span className="apk-price">
                            {format(act.price)}
                            {act.unit}
                          </span>{" "}
                          <span className="apk-onreq">{dict.pkgc_booked_via_contact}</span>
                        </>
                      ) : (
                        <span className="apk-onreq">{dict.pkgc_on_request}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
}

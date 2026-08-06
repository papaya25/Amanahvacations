"use client";

/* Editor for the packages' "See full details" popup — the intro, the
   day-by-day descriptions, the optional-add-on note and the suggested week.
   Saved to site_content "pkg_details"; the public page merges saved content
   over the built-in copy and translates it per language automatically. */

import { useDbState } from "@/lib/useDbState";
import {
  PKG_DETAILS,
  PACKAGE_IDS,
  type PkgDetails,
  type PkgId,
} from "@/app/(public)/[locale]/packages/data";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

const PKG_LABELS: Record<PkgId, string> = {
  basic: "The Basics",
  family: "Family Tour",
  water: "Water Lovers",
  explorer: "Indiana Jones",
  honeymoon: "Honeymoon Escape",
};

type DetailsState = Partial<Record<PkgId, PkgDetails>>;

const DEFAULT: DetailsState = PKG_DETAILS;

const blankDay = () => ({ title: "New day", dur: "", desc: "", included: "" });

export default function PackageDetailsAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState<DetailsState>(
    "admin_pkg_details",
    DEFAULT
  );

  const patch = (id: PkgId, p: Partial<PkgDetails>) =>
    setValue({ ...value, [id]: { ...(value[id] ?? PKG_DETAILS[id]!), ...p } });

  const patchDay = (id: PkgId, di: number, p: Partial<PkgDetails["days"][number]>) => {
    const d = value[id] ?? PKG_DETAILS[id]!;
    patch(id, { days: d.days.map((day, j) => (j === di ? { ...day, ...p } : day)) });
  };
  const addDay = (id: PkgId) => {
    const d = value[id] ?? PKG_DETAILS[id]!;
    patch(id, { days: [...d.days, blankDay()] });
  };
  const removeDay = (id: PkgId, di: number) => {
    const d = value[id] ?? PKG_DETAILS[id]!;
    patch(id, { days: d.days.filter((_, j) => j !== di) });
  };

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Package Details (popup)"
        desc={'The content of each package\'s "See full details" popup — the intro, every day\'s description and inclusions, the optional add-on note, and the suggested week (one line per day). Translations to French, Spanish and Arabic happen automatically after you save.'}
      />

      <div className="space-y-6">
        {PACKAGE_IDS.map((id) => {
          const d = value[id] ?? PKG_DETAILS[id]!;
          return (
            <Card key={id} title={PKG_LABELS[id]}>
              <div className="space-y-4">
                <TextArea
                  label="Intro paragraph"
                  value={d.intro}
                  onChange={(v) => patch(id, { intro: v })}
                  rows={3}
                />

                <div className="rounded-[14px] border border-sand bg-cream/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                      Days in detail ({d.days.length})
                    </span>
                    <button
                      onClick={() => addDay(id)}
                      className="rounded-full border-[1.5px] border-forest px-3 py-1 text-[12px] font-semibold text-forest transition hover:bg-forest hover:text-white"
                    >
                      + Add day
                    </button>
                  </div>
                  <div className="space-y-3">
                    {d.days.map((day, di) => (
                      <div key={di} className="rounded-lg border border-sand bg-white p-3">
                        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                          <Field label="Title" value={day.title} onChange={(v) => patchDay(id, di, { title: v })} />
                          <Field label="Duration line" value={day.dur} onChange={(v) => patchDay(id, di, { dur: v })} placeholder="Approximately 8 hours · 100% private" />
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${day.title}"?`)) removeDay(id, di);
                            }}
                            className="h-[42px] self-end rounded-lg border border-sand px-3 text-[12px] text-sage transition hover:border-terracotta hover:text-terracotta"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-2 space-y-2">
                          <TextArea label="Description" value={day.desc} onChange={(v) => patchDay(id, di, { desc: v })} rows={4} />
                          <Field label="Included (separate items with · )" value={day.included} onChange={(v) => patchDay(id, di, { included: v })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <TextArea
                  label="Optional add-on note (leave empty for none)"
                  value={d.addonNote ?? ""}
                  onChange={(v) => patch(id, { addonNote: v || undefined })}
                  rows={2}
                />
                <TextArea
                  label="Suggested week — one line per day"
                  value={d.week.join("\n")}
                  onChange={(v) => patch(id, { week: v.split("\n") })}
                  rows={Math.max(4, d.week.length)}
                />
                <Field
                  label="Week note"
                  value={d.weekNote}
                  onChange={(v) => patch(id, { weekNote: v })}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <SaveBar
        onSave={save}
        savedAt={savedAt}
        saving={saving}
        error={error}
        savedLabel="✓ Saved — now live on your website"
        idleLabel="Changes save to your database and update the live site."
      />
    </>
  );
}

"use client";

import { useLocalState } from "@/lib/useLocalState";
import { DESTINATIONS } from "@/data/destinations";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";

type Act = { slug: string; title: string; card: string; desc: string; hidden?: boolean };

const DEFAULT: { activities: Act[] } = {
  activities: DESTINATIONS.map((d) => ({
    slug: d.slug,
    title: d.title,
    card: d.card,
    desc: d.paragraphs[0] ?? "",
    hidden: false,
  })),
};

const blankAct = (): Act => ({
  slug: `activity-${Date.now()}`,
  title: "New activity",
  card: "",
  desc: "",
  hidden: false,
});

export default function ActivitiesAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_activities", DEFAULT);
  const acts = value.activities;
  const patch = (i: number, p: Partial<Act>) =>
    setValue({ ...value, activities: acts.map((a, j) => (j === i ? { ...a, ...p } : a)) });
  const remove = (i: number) => setValue({ ...value, activities: acts.filter((_, j) => j !== i) });
  const add = () => setValue({ ...value, activities: [blankAct(), ...acts] });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Activities"
        desc="The activity pages — add, remove or hide them, and edit each title, photo and description. These feed the Activities grid and the individual destination pages."
      />

      <button
        onClick={add}
        className="mb-5 rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-ink"
      >
        + Add a new activity
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        {acts.map((a, i) => (
          <Card key={a.slug}>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={!a.hidden}
                  onChange={(e) => patch(i, { hidden: !e.target.checked })}
                  className="h-4 w-4 accent-forest"
                />
                {a.hidden ? "Hidden" : "Visible"}
              </label>
              <button
                onClick={() => {
                  if (confirm(`Remove "${a.title}"?`)) remove(i);
                }}
                className="text-[12px] font-medium text-sage underline underline-offset-2 transition hover:text-terracotta"
              >
                Remove
              </button>
            </div>
            <ImagePicker label={a.title} src={a.card} onPick={(url) => patch(i, { card: url })} ratio="aspect-[16/10]" />
            <div className="mt-3 space-y-3">
              <Field label="Title" value={a.title} onChange={(v) => patch(i, { title: v })} />
              <TextArea label="Description" value={a.desc} onChange={(v) => patch(i, { desc: v })} rows={4} />
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

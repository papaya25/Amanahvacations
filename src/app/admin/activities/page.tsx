"use client";

import { useLocalState } from "@/lib/useLocalState";
import { DESTINATIONS } from "@/data/destinations";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";

type Act = { slug: string; title: string; card: string; desc: string };

const DEFAULT: { activities: Act[] } = {
  activities: DESTINATIONS.map((d) => ({
    slug: d.slug,
    title: d.title,
    card: d.card,
    desc: d.paragraphs[0] ?? "",
  })),
};

export default function ActivitiesAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_activities", DEFAULT);
  const setAct = (i: number, k: keyof Act, v: string) =>
    setValue({ ...value, activities: value.activities.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Activities"
        desc="The 24 activity pages — edit each title, photo and description. These feed the Activities grid and the individual destination pages."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {value.activities.map((a, i) => (
          <Card key={a.slug}>
            <ImagePicker label={a.title} src={a.card} onPick={(url) => setAct(i, "card", url)} ratio="aspect-[16/10]" />
            <div className="mt-3 space-y-3">
              <Field label="Title" value={a.title} onChange={(v) => setAct(i, "title", v)} />
              <TextArea label="Description" value={a.desc} onChange={(v) => setAct(i, "desc", v)} rows={4} />
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

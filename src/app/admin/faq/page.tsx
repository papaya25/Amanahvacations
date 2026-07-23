"use client";

import { useDbState } from "@/lib/useDbState";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

type QA = { q: string; a: string };
type FaqContent = { home: QA[]; tours: QA[]; packages: QA[] };

const DEFAULT: FaqContent = {
  home: [
    { q: "What is the best way to explore the Riviera Maya?", a: "With a private, curated trip — private tours and activities with trusted guides, hotel pickup, and an itinerary built around you." },
    { q: "Are your trips family-safe and halal-friendly?", a: "Yes to both — comfortable for families and couples, and we specialize in halal-friendly travel (halal dining, alcohol-free villas, prayer arrangements)." },
    { q: "What languages does your team speak?", a: "English, French, Spanish and Arabic." },
  ],
  tours: [
    { q: "Are your tours private or shared?", a: "Every tour is 100% private — only your group, with a private guide and private transport including hotel pickup." },
    { q: "How far in advance should I book?", a: "At least 24 hours so we can arrange your guide and transport. Earlier is better for popular and seasonal experiences." },
  ],
  packages: [
    { q: "What's included in a package?", a: "Private transfers, a series of private tours, and a personal WhatsApp concierge. Accommodation and extra experiences are optional at checkout." },
    { q: "Can I customize a package?", a: "Yes — add or remove activities, choose your accommodation tier, adjust dates, or build a fully custom plan." },
  ],
};

const SECTIONS: { key: keyof FaqContent; title: string }[] = [
  { key: "home", title: "Home page FAQ" },
  { key: "tours", title: "Tours page FAQ" },
  { key: "packages", title: "Packages page FAQ" },
];

export default function FaqAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState<FaqContent>("admin_faq", DEFAULT);

  const patch = (key: keyof FaqContent, i: number, p: Partial<QA>) =>
    setValue({ ...value, [key]: value[key].map((qa, j) => (j === i ? { ...qa, ...p } : qa)) });
  const addQA = (key: keyof FaqContent) => setValue({ ...value, [key]: [...value[key], { q: "", a: "" }] });
  const removeQA = (key: keyof FaqContent, i: number) =>
    setValue({ ...value, [key]: value[key].filter((_, j) => j !== i) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="FAQ"
        desc="The frequently-asked-questions shown on your Home, Tours and Packages pages. Good FAQs also help your Google ranking (they can appear as rich results)."
      />

      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <Card key={s.key} title={s.title}>
            <div className="space-y-4">
              {value[s.key].map((qa, i) => (
                <div key={i} className="rounded-[12px] border border-sand bg-cream/40 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                      Question {i + 1}
                    </span>
                    <button
                      onClick={() => removeQA(s.key, i)}
                      className="text-[12px] font-medium text-sage underline underline-offset-2 transition hover:text-terracotta"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <Field label="Question" value={qa.q} onChange={(v) => patch(s.key, i, { q: v })} />
                    <TextArea label="Answer" value={qa.a} onChange={(v) => patch(s.key, i, { a: v })} rows={3} />
                  </div>
                </div>
              ))}
              <button
                onClick={() => addQA(s.key)}
                className="rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
              >
                + Add question
              </button>
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

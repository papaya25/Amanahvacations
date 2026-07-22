"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

type Doc = { updated: string; body: string };
type Legal = { terms: Doc; privacy: Doc; waiver: Doc };

const placeholder = (name: string): Doc => ({
  updated: "July 21, 2026",
  body: `The full ${name} content is published from the current version on the site. Paste or edit the plain-text version here to update it. (Rich formatting and section headings are preserved through the backend when connected.)`,
});

const DEFAULT: Legal = {
  terms: placeholder("Terms & Conditions"),
  privacy: placeholder("Privacy Policy"),
  waiver: placeholder("Liability Waiver"),
};

const DOCS: { key: keyof Legal; title: string; desc: string }[] = [
  { key: "terms", title: "Terms & Conditions", desc: "Booking, payment, cancellation and refund policy." },
  { key: "privacy", title: "Privacy Policy", desc: "How you collect, use and protect customer data." },
  { key: "waiver", title: "Liability Waiver", desc: "Adventure-activity waiver and assumption of risk." },
];

export default function LegalAdmin() {
  const { value, setValue, save, savedAt } = useLocalState<Legal>("admin_legal", DEFAULT);
  const patch = (key: keyof Legal, p: Partial<Doc>) =>
    setValue({ ...value, [key]: { ...value[key], ...p } });

  return (
    <>
      <PageHead
        eyebrow="Business"
        title="Legal Pages"
        desc="Edit your Terms & Conditions, Privacy Policy and Liability Waiver. Have a lawyer review changes before publishing — these are legally binding documents."
      />

      <div className="mb-5 rounded-[14px] border border-[#f0dfa0] bg-[#fffdf5] px-4 py-3 text-[12.5px] leading-[1.6] text-[#7a5a1e]">
        Reminder: your current legal pages contain placeholders that still need your input (registered
        business name, RFC, RNT tourism-registration number, and dispute jurisdiction). Fill those in
        with your lawyer before going live.
      </div>

      <div className="space-y-5">
        {DOCS.map((d) => (
          <Card key={d.key} title={d.title} desc={d.desc}>
            <div className="space-y-4">
              <Field label="Last updated" value={value[d.key].updated} onChange={(v) => patch(d.key, { updated: v })} />
              <TextArea label="Document text" value={value[d.key].body} onChange={(v) => patch(d.key, { body: v })} rows={12} />
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

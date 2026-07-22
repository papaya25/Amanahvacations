"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

type ValueCard = { title: string; desc: string };
type About = {
  headline: string;
  intro: string;
  quote: string;
  story: string;
  values: ValueCard[];
  closingTitle: string;
  closingText: string;
};

const DEFAULT: About = {
  headline: "We know where to find real adventure",
  intro:
    "The Riviera Maya is more than just a destination — it's a place where nature, culture, and unforgettable experiences come together. At Amanah Vacations, we go beyond simply offering activities — we design complete experiences, taking care of every detail so you can fully enjoy your journey.",
  quote: "We don't believe in one-size-fits-all travel. Every journey is different — and that's exactly how we design it. For you.",
  story:
    "Our journey began with a simple idea: to share the beauty and diversity of the Riviera Maya with the world. We open this incredible destination to a wider audience — welcoming guests from North Africa, the Middle East, and South & East Asia — with a multilingual team and deep attention to detail.",
  values: [
    { title: "Multilingual Team", desc: "English, Français, Español & العربية — we welcome travelers from every corner of the world." },
    { title: "Every Detail Handled", desc: "From first contact to your final day, everything is seamless, organized and tailored." },
    { title: "Private & Luxury", desc: "High-end, private and discreet experiences for those who value comfort and exclusivity." },
    { title: "Halal-Friendly", desc: "Carefully selected stays and activities that respect Muslim travelers' values and lifestyle." },
  ],
  closingTitle: "Turning unforgettable moments into your ultimate adventure",
  closingText:
    "The Riviera Maya offers experiences found nowhere else in the world — magical cenotes, iconic sites like Tulum and Chichén Itzá, and moments that are authentic and deeply immersive. No matter where you come from, once you've experienced the Riviera Maya, a part of Mexico will always live within you.",
};

export default function AboutAdmin() {
  const { value, setValue, save, savedAt } = useLocalState<About>("admin_about", DEFAULT);
  const set = (k: keyof About, v: string) => setValue({ ...value, [k]: v });
  const setValueCard = (i: number, p: Partial<ValueCard>) =>
    setValue({ ...value, values: value.values.map((c, j) => (j === i ? { ...c, ...p } : c)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="About Page"
        desc="Your story and the values shown on the About page."
      />

      <div className="space-y-5">
        <Card title="Header & intro">
          <div className="space-y-4">
            <Field label="Headline" value={value.headline} onChange={(v) => set("headline", v)} />
            <TextArea label="Intro paragraph" value={value.intro} onChange={(v) => set("intro", v)} rows={4} />
          </div>
        </Card>

        <Card title="Our story">
          <div className="space-y-4">
            <TextArea label="Pull quote" value={value.quote} onChange={(v) => set("quote", v)} rows={2} />
            <TextArea label="Story paragraph" value={value.story} onChange={(v) => set("story", v)} rows={5} />
          </div>
        </Card>

        <Card title="Value cards" desc="The four highlights of the Amanah difference.">
          <div className="grid gap-4 sm:grid-cols-2">
            {value.values.map((c, i) => (
              <div key={i} className="rounded-[12px] border border-sand bg-cream/40 p-3.5">
                <div className="space-y-3">
                  <Field label={`Card ${i + 1} title`} value={c.title} onChange={(v) => setValueCard(i, { title: v })} />
                  <TextArea label="Description" value={c.desc} onChange={(v) => setValueCard(i, { desc: v })} rows={2} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Closing section">
          <div className="space-y-4">
            <Field label="Closing title" value={value.closingTitle} onChange={(v) => set("closingTitle", v)} />
            <TextArea label="Closing text" value={value.closingText} onChange={(v) => set("closingText", v)} rows={4} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

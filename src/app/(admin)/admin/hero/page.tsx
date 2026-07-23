"use client";

import { useDbState } from "@/lib/useDbState";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";

type Slide = { image: string; name: string; sub: string };
type HeroContent = {
  headline: string;
  headlineEm: string;
  tagline: string;
  slides: Slide[];
  dreamTitle: string;
  dreamText: string;
};

const DEFAULT: HeroContent = {
  headline: "The Real",
  headlineEm: "Riviera Maya.",
  tagline:
    "Skip the crowds and the noise. Private tours, hidden cenotes, and Caribbean beaches — curated for families and couples who want something more than an ordinary holiday.",
  slides: [
    { image: "/images/hero-cenotes.jpg", name: "Hidden Cenotes", sub: "Sacred underground rivers" },
    { image: "/images/hero-tulum.jpg", name: "Tulum Ruins", sub: "Ancient Mayan civilisation" },
    { image: "/images/hero-dining.jpg", name: "Sunset Dining", sub: "Private beachside experience" },
    { image: "/images/hero-jungle.jpg", name: "Jungle Adventure", sub: "Zip-lines & Mayan ruins" },
    { image: "/images/hero-villas.jpg", name: "Luxury Villas", sub: "Infinity pools & Caribbean views" },
    { image: "/images/hero-beaches.jpg", name: "Private Beaches", sub: "Exclusive cabanas & white sands" },
  ],
  dreamTitle: "Your dream adventure is just around the corner",
  dreamText:
    "Your dream adventure in the Riviera Maya is just around the corner, where lush jungle paths lead to hidden cenotes, turquoise waters stretch endlessly, and every moment is filled with excitement.",
};

export default function HeroAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState<HeroContent>("admin_hero", DEFAULT);
  const set = (k: keyof HeroContent, v: string) => setValue({ ...value, [k]: v });
  const setSlide = (i: number, k: keyof Slide, v: string) =>
    setValue({ ...value, slides: value.slides.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Hero & Homepage"
        desc="The rotating hero slideshow on the home page, plus the main headline and the closing 'dream adventure' text."
      />

      <div className="space-y-5">
        <Card title="Headline & tagline">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Headline (line 1)" value={value.headline} onChange={(v) => set("headline", v)} />
            <Field label="Headline (italic line 2)" value={value.headlineEm} onChange={(v) => set("headlineEm", v)} />
          </div>
          <div className="mt-4">
            <TextArea label="Tagline" value={value.tagline} onChange={(v) => set("tagline", v)} rows={3} />
          </div>
        </Card>

        <Card title="Hero slideshow" desc="Six rotating slides. Each has a photo and a caption.">
          <div className="grid gap-4 md:grid-cols-2">
            {value.slides.map((s, i) => (
              <div key={i} className="rounded-[14px] border border-sand bg-cream/40 p-4">
                <ImagePicker
                  label={`Slide ${i + 1} image`}
                  src={s.image}
                  onPick={(url) => setSlide(i, "image", url)}
                  ratio="aspect-[16/10]"
                />
                <div className="mt-3 grid gap-3">
                  <Field label="Caption title" value={s.name} onChange={(v) => setSlide(i, "name", v)} />
                  <Field label="Caption subtitle" value={s.sub} onChange={(v) => setSlide(i, "sub", v)} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="“Dream adventure” section">
          <div className="space-y-4">
            <Field label="Title" value={value.dreamTitle} onChange={(v) => set("dreamTitle", v)} />
            <TextArea label="Opening paragraph" value={value.dreamText} onChange={(v) => set("dreamText", v)} rows={4} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, ImagePicker, PageHead, SaveBar } from "../AdminUI";

type Tour = {
  key: string;
  name: string;
  sub: string;
  dur: string;
  price: number;
  onreq: boolean;
  img: string;
};

const DEFAULT: { tours: Tour[] } = {
  tours: [
    { key: "akumalcenotes", name: "Cenotes, Coral & Sea Turtles", sub: "Dos Ojos Cenote + Akumal Snorkeling", dur: "6 hours", price: 2350, onreq: false, img: "/images/tours/akumalcenotes.jpg" },
    { key: "tulumcenotes", name: "Cenotes & the Ruins of Tulum", sub: "Dos Ojos Cenote + Tulum Archaeological Site", dur: "6–8 hours", price: 3700, onreq: false, img: "/images/tours/tulumcenotes.jpg" },
    { key: "cobacenotes", name: "Coba Ruins & Jungle Cenotes", sub: "Coba Zone + Choo-Ha & Tankach-Ha", dur: "Full day", price: 3900, onreq: false, img: "/images/tours/cobacenotes.jpg" },
    { key: "cozumel", name: "Cozumel Private Boat Snorkeling", sub: "El Cielo, El Cielito, Colombia & Lever Reefs", dur: "Approx. 4 hours", price: 4600, onreq: false, img: "/images/tours/cozumel.jpg" },
    { key: "akumaltulum", name: "Tulum & Akumal", sub: "Dos Ojos + Tulum Ruins + Akumal Snorkeling", dur: "Full day", price: 5850, onreq: false, img: "/images/tours/akumaltulum.jpg" },
    { key: "chichen", name: "Chichen Itza & Valladolid", sub: "New 7 Wonders + Suytun & Samulá Cenotes", dur: "Full day", price: 6600, onreq: false, img: "/images/tours/chichen.jpg" },
    { key: "rutacenotes", name: "Ruta de Cenotes", sub: "4 Cenotes + Diving Platform + Zip Line", dur: "Half day", price: 2900, onreq: false, img: "/images/tours/rutacenotes.jpg" },
    { key: "holbox", name: "Holbox Island Overnight Escape", sub: "2 Days, 1 Night", dur: "Overnight", price: 0, onreq: true, img: "/images/tours/holbox.jpg" },
    { key: "contoy", name: "Isla Contoy National Park", sub: "Ixlaché Reef + Isla Contoy + Isla Mujeres", dur: "Full day", price: 0, onreq: true, img: "/images/tours/contoy.jpg" },
  ],
};

export default function ToursAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_tours", DEFAULT);
  const setTour = (i: number, k: keyof Tour, v: string | number | boolean) =>
    setValue({ ...value, tours: value.tours.map((t, j) => (j === i ? { ...t, [k]: v } : t)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Tours"
        desc="Prices are per person in MXN. Mark a tour 'On request' for group-priced trips (Buy Now is hidden and customers request it instead)."
      />

      <div className="space-y-5">
        {value.tours.map((t, i) => (
          <Card key={t.key}>
            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              <ImagePicker label="Photo" src={t.img} onPick={(url) => setTour(i, "img", url)} />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={t.name} onChange={(v) => setTour(i, "name", v)} />
                  <Field label="Subtitle" value={t.sub} onChange={(v) => setTour(i, "sub", v)} />
                  <Field label="Duration" value={t.dur} onChange={(v) => setTour(i, "dur", v)} />
                  <Field
                    label="Price (per person)"
                    type="number"
                    prefix="$"
                    suffix="MXN"
                    value={t.price}
                    onChange={(v) => setTour(i, "price", Number(v) || 0)}
                  />
                </div>
                <label className="flex items-center gap-2.5 text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={t.onreq}
                    onChange={(e) => setTour(i, "onreq", e.target.checked)}
                    className="h-4 w-4 accent-forest"
                  />
                  On request (group-priced — no online price shown)
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

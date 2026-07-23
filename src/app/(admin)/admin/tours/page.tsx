"use client";

import { useDbState } from "@/lib/useDbState";
import { TOURS } from "@/app/(public)/[locale]/tours/ToursClient";
import { Card, Field, ImagePicker, PageHead, SaveBar } from "../AdminUI";

type Stop = { time: string; place: string; desc: string };
type AdminTour = {
  key: string;
  name: string;
  sub: string;
  dur: string;
  price: number;
  offer: number;
  onreq: boolean;
  hidden: boolean;
  img: string;
  stops: Stop[];
};

const DEFAULT: { tours: AdminTour[] } = {
  tours: TOURS.map((t) => ({
    key: t.key ?? t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: t.name,
    sub: t.sub,
    dur: t.dur,
    price: t.price ?? 0,
    offer: 0,
    onreq: !!t.onreq,
    hidden: false,
    img: t.img,
    stops: t.stops.map((s) => ({ time: s[0], place: s[1], desc: s[2] })),
  })),
};

const blankTour = (): AdminTour => ({
  key: `tour-${Date.now()}`,
  name: "New tour",
  sub: "",
  dur: "Full day",
  price: 0,
  offer: 0,
  onreq: false,
  hidden: false,
  img: "",
  stops: [],
});

export default function ToursAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState("admin_tours", DEFAULT);
  const tours = value.tours;
  const patch = (i: number, p: Partial<AdminTour>) =>
    setValue({ ...value, tours: tours.map((t, j) => (j === i ? { ...t, ...p } : t)) });
  const removeTour = (i: number) => setValue({ ...value, tours: tours.filter((_, j) => j !== i) });
  const addTour = () => setValue({ ...value, tours: [blankTour(), ...tours] });

  const setStop = (ti: number, si: number, p: Partial<Stop>) =>
    patch(ti, { stops: tours[ti].stops.map((s, j) => (j === si ? { ...s, ...p } : s)) });
  const addStop = (ti: number) =>
    patch(ti, { stops: [...tours[ti].stops, { time: "", place: "", desc: "" }] });
  const removeStop = (ti: number, si: number) =>
    patch(ti, { stops: tours[ti].stops.filter((_, j) => j !== si) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Tours"
        desc="Add, remove or hide tours, set prices and offers, and edit each itinerary. Prices are per person in MXN. Set an 'Offer price' below the normal price to run a sale — leave it 0 for no offer."
      />

      <button
        onClick={addTour}
        className="mb-5 rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-ink"
      >
        + Add a new tour
      </button>

      <div className="space-y-5">
        {tours.map((t, i) => (
          <Card key={t.key}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={!t.hidden}
                  onChange={(e) => patch(i, { hidden: !e.target.checked })}
                  className="h-4 w-4 accent-forest"
                />
                {t.hidden ? "Hidden" : "Visible on site"}
              </label>
              <button
                onClick={() => {
                  if (confirm(`Remove "${t.name}"? You can re-add it later.`)) removeTour(i);
                }}
                className="rounded-full border border-sand px-3.5 py-1.5 text-[12px] font-medium text-sage transition hover:border-terracotta hover:text-terracotta"
              >
                Remove tour
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              <ImagePicker label="Photo" src={t.img} onPick={(url) => patch(i, { img: url })} />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={t.name} onChange={(v) => patch(i, { name: v })} />
                  <Field label="Subtitle" value={t.sub} onChange={(v) => patch(i, { sub: v })} />
                  <Field label="Duration" value={t.dur} onChange={(v) => patch(i, { dur: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Price"
                      type="number"
                      prefix="$"
                      value={t.price}
                      onChange={(v) => patch(i, { price: Number(v) || 0 })}
                    />
                    <Field
                      label="Offer price"
                      type="number"
                      prefix="$"
                      value={t.offer}
                      onChange={(v) => patch(i, { offer: Number(v) || 0 })}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={t.onreq}
                    onChange={(e) => patch(i, { onreq: e.target.checked })}
                    className="h-4 w-4 accent-forest"
                  />
                  On request (group-priced — no online price shown)
                </label>
              </div>
            </div>

            {/* Itinerary editor */}
            <div className="mt-5 rounded-[14px] border border-sand bg-cream/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                  Itinerary ({t.stops.length} stops)
                </span>
                <button
                  onClick={() => addStop(i)}
                  className="rounded-full border-[1.5px] border-forest px-3 py-1 text-[12px] font-semibold text-forest transition hover:bg-forest hover:text-white"
                >
                  + Add stop
                </button>
              </div>
              <div className="space-y-2.5">
                {t.stops.map((s, si) => (
                  <div
                    key={si}
                    className="grid gap-2 rounded-lg border border-sand bg-white p-2.5 sm:grid-cols-[140px_1fr_auto]"
                  >
                    <Field label="Time" value={s.time} onChange={(v) => setStop(i, si, { time: v })} placeholder="Morning" />
                    <div className="grid gap-2">
                      <Field label="Place" value={s.place} onChange={(v) => setStop(i, si, { place: v })} />
                      <Field label="Note" value={s.desc} onChange={(v) => setStop(i, si, { desc: v })} />
                    </div>
                    <button
                      onClick={() => removeStop(i, si)}
                      className="h-[42px] self-end rounded-lg border border-sand px-3 text-[12px] text-sage transition hover:border-terracotta hover:text-terracotta"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {t.stops.length === 0 && (
                  <p className="text-[12.5px] text-sage">No itinerary yet — add stops above.</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

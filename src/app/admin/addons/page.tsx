"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type Addon = {
  id: string;
  name: string;
  price: number;
  offer?: number;
  unit: string;
  onRequest: boolean;
  hidden?: boolean;
};

const DEFAULT: { addons: Addon[] } = {
  addons: [
    { id: "chichen", name: "Chichén + Valladolid", price: 6600, unit: "/person", onRequest: false },
    { id: "tulumcenotes", name: "Tulum & Cenotes Tour", price: 3700, unit: "/person", onRequest: false },
    { id: "cobacenotes", name: "Cobá & Cenotes Tour", price: 3900, unit: "/person", onRequest: false },
    { id: "akumaltulum", name: "Tulum + Akumal", price: 5850, unit: "/person", onRequest: false },
    { id: "akumalcenotes", name: "Akumal & Cenotes Tour", price: 2350, unit: "/person", onRequest: false },
    { id: "cancun", name: "Cancún City Tour", price: 800, unit: "/person", onRequest: false },
    { id: "quinta", name: "Quinta Av Guided Tour", price: 500, unit: "/person", onRequest: false },
    { id: "aquarium", name: "Cancún Aquarium", price: 950, unit: "/person", onRequest: false },
    { id: "cozumel", name: "Cozumel Private Tour", price: 4600, unit: "/person", onRequest: false },
    { id: "rutacenotes", name: "Ruta de los Cenotes Tour", price: 2900, unit: "/person", onRequest: false },
    { id: "cenotevisit", name: "Cenote Visit", price: 1000, unit: "/person", onRequest: false },
    { id: "xcaret", name: "Xcaret Park", price: 3500, unit: "/person", onRequest: false },
    { id: "xelha", name: "Xel-Há Park", price: 2850, unit: "/person", onRequest: false },
    { id: "xplor", name: "Xplor Park", price: 3350, unit: "/person", onRequest: false },
    { id: "xplorfuego", name: "Xplor Fuego", price: 2850, unit: "/person", onRequest: false },
    { id: "xsenses", name: "Xenses Park", price: 1850, unit: "/person", onRequest: false },
    { id: "monkey", name: "Monkey Sanctuary", price: 1900, unit: "/person", onRequest: false },
    { id: "tennis", name: "Tennis Lessons", price: 800, unit: "/hour/person", onRequest: false },
    { id: "contoy", name: "Isla Contoy", price: 0, unit: "", onRequest: true },
    { id: "whalesharks", name: "Whale Sharks Tour", price: 0, unit: "", onRequest: true },
    { id: "yacht", name: "Private Yacht", price: 0, unit: "", onRequest: true },
    { id: "siankaan", name: "Sian Ka'an", price: 0, unit: "", onRequest: true },
    { id: "zipline", name: "Zipline & ATV", price: 0, unit: "", onRequest: true },
    { id: "photoshoot", name: "Photoshoot", price: 0, unit: "", onRequest: true },
    { id: "dinner", name: "Romantic Dinner", price: 0, unit: "", onRequest: true },
    { id: "bacalar", name: "Bacalar Lagoon", price: 0, unit: "", onRequest: true },
  ],
};

const blankAddon = (): Addon => ({
  id: `addon-${Date.now()}`,
  name: "New add-on",
  price: 0,
  offer: 0,
  unit: "/person",
  onRequest: false,
  hidden: false,
});

export default function AddonsAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_addons", DEFAULT);
  const addons = value.addons;
  const setAddon = (i: number, k: keyof Addon, v: string | number | boolean) =>
    setValue({ ...value, addons: addons.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });
  const remove = (i: number) => setValue({ ...value, addons: addons.filter((_, j) => j !== i) });
  const add = () => setValue({ ...value, addons: [blankAddon(), ...addons] });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Add-ons"
        desc="The experiences customers can add to a package (and in 'Build Your Own Plan'). Prices are per person in MXN. Set an 'Offer' below the price for a sale, hide any add-on, or add new ones. 'On request' items are priced by your team."
      />

      <button
        onClick={add}
        className="mb-5 rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-ink"
      >
        + Add a new add-on
      </button>

      <Card>
        <div className="space-y-2.5">
          {addons.map((a, i) => (
            <div
              key={a.id}
              className="grid items-end gap-3 rounded-xl border border-sand bg-cream/40 p-3 sm:grid-cols-[1fr_110px_110px_100px_auto_auto]"
            >
              <Field label="Name" value={a.name} onChange={(v) => setAddon(i, "name", v)} />
              <Field
                label="Price"
                type="number"
                prefix="$"
                value={a.price}
                onChange={(v) => setAddon(i, "price", Number(v) || 0)}
              />
              <Field
                label="Offer"
                type="number"
                prefix="$"
                value={a.offer ?? 0}
                onChange={(v) => setAddon(i, "offer", Number(v) || 0)}
              />
              <Field label="Unit" value={a.unit} onChange={(v) => setAddon(i, "unit", v)} placeholder="/person" />
              <div className="flex h-[42px] flex-col justify-center gap-0.5 text-[11px] text-ink">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={a.onRequest} onChange={(e) => setAddon(i, "onRequest", e.target.checked)} className="h-3.5 w-3.5 accent-forest" />
                  On request
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={!!a.hidden} onChange={(e) => setAddon(i, "hidden", e.target.checked)} className="h-3.5 w-3.5 accent-forest" />
                  Hidden
                </label>
              </div>
              <button
                onClick={() => remove(i)}
                className="h-[42px] self-end rounded-lg border border-sand px-3 text-[12px] text-sage transition hover:border-terracotta hover:text-terracotta"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

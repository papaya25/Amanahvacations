"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type Addon = { id: string; name: string; price: number; unit: string; onRequest: boolean };

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

export default function AddonsAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_addons", DEFAULT);
  const setAddon = (i: number, k: keyof Addon, v: string | number | boolean) =>
    setValue({ ...value, addons: value.addons.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Add-ons"
        desc="The experiences customers can add to a package. Prices are per person in MXN unless the unit says otherwise. 'On request' items are priced by your team (no online price)."
      />

      <Card>
        <div className="space-y-2.5">
          {value.addons.map((a, i) => (
            <div
              key={a.id}
              className="grid items-end gap-3 rounded-xl border border-sand bg-cream/40 p-3 sm:grid-cols-[1fr_130px_120px_auto]"
            >
              <Field label="Name" value={a.name} onChange={(v) => setAddon(i, "name", v)} />
              <Field
                label="Price"
                type="number"
                prefix="$"
                value={a.price}
                onChange={(v) => setAddon(i, "price", Number(v) || 0)}
              />
              <Field label="Unit" value={a.unit} onChange={(v) => setAddon(i, "unit", v)} placeholder="/person" />
              <label className="flex h-[42px] items-center gap-2 whitespace-nowrap text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={a.onRequest}
                  onChange={(e) => setAddon(i, "onRequest", e.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                On request
              </label>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

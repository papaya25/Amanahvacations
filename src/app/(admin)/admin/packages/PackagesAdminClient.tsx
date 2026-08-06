"use client";

import { useState } from "react";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";
import { savePackages } from "./actions";

export type Pkg = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  /** Per-person "from" anchor — derived automatically from the tiers on save. */
  price: number;
  offer: number;
  /** TOTAL group price (MXN) per pax count; 0 = that size isn't offered. */
  prices?: Record<string, number> | null;
  hidden: boolean;
  photo: string;
  includes: string;
};

/** Group sizes shown in the pricing grid (matches the tours editor). */
const PAX_SIZES = [2, 3, 4, 5, 6] as const;

// Seed used only as a fallback when the backend isn't reachable.
export const DEFAULT_PACKAGES: Pkg[] = [
  { id: "basic", name: "The Basics", tagline: "The essentials, done properly — ruins, cenote, turtles and the town", badge: "Essential", price: 5525, offer: 0, prices: { "2": 11050, "3": 14050, "4": 16800, "5": 20200, "6": 23150 }, hidden: false, photo: "/images/pkg/basic.jpg", includes: "Private airport transfers — Cancún International, arrival & departure\nTulum Ruins, Cenote Dos Ojos & Akumal — the signature day\nSnorkelling in Playa del Carmen — the reef minutes from town\nPlaya del Carmen tour — Quinta Avenida & the town\n24/7 WhatsApp concierge" },
  { id: "family", name: "Family Tour", tagline: "For families — turtles, monkeys, cenotes and a park built for wonder", badge: "Kid-Friendly", price: 9033, offer: 0, prices: { "3": 27100, "4": 34300, "5": 41850, "6": 48550 }, hidden: false, photo: "/images/pkg/family.jpg", includes: "Private airport transfers — Cancún International, arrival & departure\nAkumal & the Monkey Sanctuary — sea turtles & rescued wildlife\nCenote Cristalino & Cenote Azul — open-air, shallow and easy\nPlaya del Carmen tour — Quinta Avenida & the town\nXenses Park — full admission\n24/7 WhatsApp concierge" },
  { id: "water", name: "Water Lovers", tagline: "For those who live for the sea — reefs, turtles and the clearest water in the Caribbean", badge: "Water & Reef", price: 10117, offer: 0, prices: { "3": 30350, "4": 34150, "5": 39350, "6": 43650 }, hidden: false, photo: "/images/pkg/water.jpg", includes: "Private airport transfers — Cancún International, arrival & departure\nAkumal & Cenote Dos Ojos — turtle snorkelling & the cave cenote\nCozumel — private boat to El Cielo & El Cielito\nRuta de los Cenotes — four cenotes, two underground, two open-air\n24/7 WhatsApp concierge" },
  { id: "explorer", name: "Indiana Jones", tagline: "For the explorer — three Mayan cities, four cenotes, and the Caribbean", badge: "Culture & Wonders", price: 11800, offer: 0, prices: { "2": 23600, "3": 29650, "4": 35350, "5": 41550, "6": 47300 }, hidden: false, photo: "/images/pkg/explorer.jpg", includes: "Private airport transfers — Cancún International, arrival & departure\nChichén Itzá & Valladolid — with Cenote Suytun & Cenote Samulá\nCobá — with Cenote Choo-Ha & Cenote Tankach-Ha\nTulum Ruins & Akumal — clifftop ruins & turtle snorkelling\nPlaya del Carmen tour — Quinta Avenida & the town\n24/7 WhatsApp concierge" },
  { id: "honeymoon", name: "Honeymoon Escape", tagline: "For two — private, halal-certified, unforgettable", badge: "Couples", price: 22500, offer: 0, prices: { "2": 45000 }, hidden: false, photo: "/images/pkg/honeymoon.jpg", includes: "Private airport transfers — Cancún International, arrival & departure\nHolbox Island — full day by private boat\nTulum Ruins, Cenote Dos Ojos & Akumal — private guided day\nXcaret Plus — full park access, buffet & the evening show\nJungle Adventure — ATV, ziplines & two cenotes\nPlaya del Carmen evening — Quinta Avenida & romantic dinner\n100% halal certified — every meal & supplier verified\n24/7 WhatsApp concierge" },
  { id: "vip", name: "VIP Plan", tagline: "Luxury & Total Freedom", badge: "Premium", price: 0, offer: 0, hidden: false, photo: "/images/pkg/vip.jpg", includes: "Luxury hotels or private villas\nPrivate transport with dedicated driver\nFully private tours & flexible itinerary\nPrivate boat or yacht experiences\nPrivate chef options\nConcierge service 24/7" },
];

const blankPkg = (): Pkg => ({
  id: `pkg-${Date.now()}`,
  name: "New package",
  tagline: "",
  badge: "New",
  price: 0,
  offer: 0,
  prices: { "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 },
  hidden: false,
  photo: "",
  includes: "",
});

export default function PackagesAdminClient({ initial }: { initial: Pkg[] }) {
  const [pkgs, setPkgs] = useState<Pkg[]>(initial);
  const [savedAt, setSavedAt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (i: number, p: Partial<Pkg>) =>
    setPkgs(pkgs.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const remove = (i: number) => setPkgs(pkgs.filter((_, j) => j !== i));
  const add = () => setPkgs([blankPkg(), ...pkgs]);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await savePackages(pkgs);
    setSaving(false);
    if (res.ok) setSavedAt(Date.now());
    else setError(res.error || "Could not save. Please try again.");
  };

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Packages"
        desc="Add, remove or hide packages, set group prices, what's included and photos. Each price is the TOTAL for the whole group in MXN — leave a size at 0 if you don't offer it (e.g. Family starts at 3, Honeymoon is for 2 only). The per-person 'From' price updates automatically. VIP is priced on request; leave all its prices 0. Changes go live as soon as you save."
      />

      <button
        onClick={add}
        className="mb-5 rounded-full bg-forest px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-ink"
      >
        + Add a new package
      </button>

      <div className="space-y-5">
        {pkgs.map((p, i) => (
          <Card key={p.id}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={!p.hidden}
                  onChange={(e) => patch(i, { hidden: !e.target.checked })}
                  className="h-4 w-4 accent-forest"
                />
                {p.hidden ? "Hidden" : "Visible on site"}
              </label>
              <button
                onClick={() => {
                  if (confirm(`Remove "${p.name}"?`)) remove(i);
                }}
                className="rounded-full border border-sand px-3.5 py-1.5 text-[12px] font-medium text-sage transition hover:border-terracotta hover:text-terracotta"
              >
                Remove package
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-[240px_1fr]">
              <ImagePicker label="Photo" src={p.photo} onPick={(url) => patch(i, { photo: url })} />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={p.name} onChange={(v) => patch(i, { name: v })} />
                  <Field label="Tagline" value={p.tagline} onChange={(v) => patch(i, { tagline: v })} />
                  <Field label="Badge" value={p.badge} onChange={(v) => patch(i, { badge: v })} />
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                    Group pricing — total for the whole group (MXN)
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {PAX_SIZES.map((pax) => {
                      const total = Number(p.prices?.[String(pax)]) || 0;
                      return (
                        <div key={pax}>
                          <Field
                            label={`${pax} people`}
                            type="number"
                            prefix="$"
                            value={total}
                            onChange={(v) =>
                              patch(i, {
                                prices: { ...(p.prices ?? {}), [String(pax)]: Number(v) || 0 },
                              })
                            }
                          />
                          <div className="mt-1 text-[11.5px] text-sage">
                            {total > 0 ? `$${Math.round(total / pax).toLocaleString("en-US")} /person` : "not offered"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <TextArea
                  label="What's included (one per line)"
                  value={p.includes}
                  onChange={(v) => patch(i, { includes: v })}
                  rows={6}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SaveBar
        onSave={save}
        savedAt={savedAt}
        saving={saving}
        error={error}
        savedLabel="✓ Saved — now live on your website"
        idleLabel="Changes save to your database and update the live site."
      />
    </>
  );
}

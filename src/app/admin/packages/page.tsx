"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";

type Pkg = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number;
  offer: number;
  hidden: boolean;
  photo: string;
  includes: string;
};

const DEFAULT: { packages: Pkg[] } = {
  packages: [
    { id: "basic", name: "The Basics", tagline: "Essential Riviera Maya", badge: "Essential", price: 4600, offer: 0, hidden: false, photo: "/images/pkg/basic.jpg", includes: "Private airport transfers Cancún ↔ PDC\nCenote visit\nSnorkeling in Playa del Carmen\nBeach Club Xpu-Ha\nGuided Quinta Avenida tour\nPersonal WhatsApp concierge" },
    { id: "family", name: "Family Tour", tagline: "Kid-Friendly Riviera Maya", badge: "Kid-Friendly", price: 8200, offer: 0, hidden: false, photo: "/images/pkg/family.jpg", includes: "Private airport transfers Cancún ↔ PDC\nTulum Ruins & City Tour\nCenotes Tour\nCancún Aquarium\nXenses Park or Monkey Sanctuary\nPersonal WhatsApp concierge" },
    { id: "water", name: "Water Lovers", tagline: "Beaches, Reefs & Cenotes", badge: "Water & Reef", price: 7600, offer: 6650, hidden: false, photo: "/images/pkg/water.jpg", includes: "Private airport transfers Cancún ↔ PDC\nAkumal day trip — snorkeling with sea turtles\nCenotes Tour — 4 cenotes, water zip line\nSnorkeling in Playa del Carmen\nPersonal WhatsApp concierge" },
    { id: "explorer", name: "Indiana Jones", tagline: "Culture & Wonders", badge: "Culture & Wonders", price: 11850, offer: 0, hidden: false, photo: "/images/pkg/explorer.jpg", includes: "Private airport transfers Cancún ↔ PDC\nChichén Itzá full day\nValladolid stop\nTulum ruins day trip\nCenote Dos Ojos stop\nPlaya del Carmen Explorer Tour\nPersonal WhatsApp concierge" },
    { id: "honeymoon", name: "Honeymoon Escape", tagline: "Romance & Intimacy", badge: "Couples", price: 14300, offer: 0, hidden: false, photo: "/images/pkg/honeymoon.jpg", includes: "Private airport transfers Cancún ↔ PDC\nCozumel private tour by private boat\nIsla Contoy day trip\nRomantic dinner\nQuinta Avenida stroll\nXcaret Park\nPersonal WhatsApp concierge" },
    { id: "vip", name: "VIP Plan", tagline: "Luxury & Total Freedom", badge: "Premium", price: 0, offer: 0, hidden: false, photo: "/images/pkg/vip.jpg", includes: "Luxury hotels or private villas\nPrivate transport with dedicated driver\nFully private tours & flexible itinerary\nPrivate boat or yacht experiences\nPrivate chef options\nConcierge service 24/7" },
  ],
};

const blankPkg = (): Pkg => ({
  id: `pkg-${Date.now()}`,
  name: "New package",
  tagline: "",
  badge: "New",
  price: 0,
  offer: 0,
  hidden: false,
  photo: "",
  includes: "",
});

export default function PackagesAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_packages", DEFAULT);
  const pkgs = value.packages;
  const patch = (i: number, p: Partial<Pkg>) =>
    setValue({ ...value, packages: pkgs.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const remove = (i: number) => setValue({ ...value, packages: pkgs.filter((_, j) => j !== i) });
  const add = () => setValue({ ...value, packages: [blankPkg(), ...pkgs] });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Packages"
        desc="Add, remove or hide packages, set prices, offers, what's included and photos. Prices are per person in MXN. Set an 'Offer price' below the normal price to run a sale — leave it 0 for no offer. VIP is priced on request; leave its price 0."
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
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Price / person"
                      type="number"
                      prefix="$"
                      value={p.price}
                      onChange={(v) => patch(i, { price: Number(v) || 0 })}
                    />
                    <Field
                      label="Offer price"
                      type="number"
                      prefix="$"
                      value={p.offer}
                      onChange={(v) => patch(i, { offer: Number(v) || 0 })}
                    />
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

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, ImagePicker, PageHead, SaveBar, TextArea } from "../AdminUI";

type Pkg = {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number;
  photo: string;
  includes: string;
};

const DEFAULT: { packages: Pkg[] } = {
  packages: [
    { id: "basic", name: "The Basics", tagline: "Essential Riviera Maya", badge: "Essential", price: 4600, photo: "/images/pkg/basic.jpg", includes: "Private airport transfers Cancún ↔ PDC\nCenote visit\nSnorkeling in Playa del Carmen\nBeach Club Xpu-Ha\nGuided Quinta Avenida tour\nPersonal WhatsApp concierge" },
    { id: "family", name: "Family Tour", tagline: "Kid-Friendly Riviera Maya", badge: "Kid-Friendly", price: 8200, photo: "/images/pkg/family.jpg", includes: "Private airport transfers Cancún ↔ PDC\nTulum Ruins & City Tour\nCenotes Tour\nCancún Aquarium\nXenses Park or Monkey Sanctuary\nPersonal WhatsApp concierge" },
    { id: "water", name: "Water Lovers", tagline: "Beaches, Reefs & Cenotes", badge: "Water & Reef", price: 7600, photo: "/images/pkg/water.jpg", includes: "Private airport transfers Cancún ↔ PDC\nAkumal day trip — snorkeling with sea turtles\nCenotes Tour — 4 cenotes, water zip line\nSnorkeling in Playa del Carmen\nPersonal WhatsApp concierge" },
    { id: "explorer", name: "Indiana Jones", tagline: "Culture & Wonders", badge: "Culture & Wonders", price: 11850, photo: "/images/pkg/explorer.jpg", includes: "Private airport transfers Cancún ↔ PDC\nChichén Itzá full day\nValladolid stop\nTulum ruins day trip\nCenote Dos Ojos stop\nPlaya del Carmen Explorer Tour\nPersonal WhatsApp concierge" },
    { id: "honeymoon", name: "Honeymoon Escape", tagline: "Romance & Intimacy", badge: "Couples", price: 14300, photo: "/images/pkg/honeymoon.jpg", includes: "Private airport transfers Cancún ↔ PDC\nCozumel private tour by private boat\nIsla Contoy day trip\nRomantic dinner\nQuinta Avenida stroll\nXcaret Park\nPersonal WhatsApp concierge" },
    { id: "vip", name: "VIP Plan", tagline: "Luxury & Total Freedom", badge: "Premium", price: 0, photo: "/images/pkg/vip.jpg", includes: "Luxury hotels or private villas\nPrivate transport with dedicated driver\nFully private tours & flexible itinerary\nPrivate boat or yacht experiences\nPrivate chef options\nConcierge service 24/7" },
  ],
};

export default function PackagesAdmin() {
  const { value, setValue, save, savedAt } = useLocalState("admin_packages", DEFAULT);
  const setPkg = (i: number, k: keyof Pkg, v: string | number) =>
    setValue({ ...value, packages: value.packages.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });

  return (
    <>
      <PageHead
        eyebrow="Content"
        title="Packages"
        desc="Edit each package's name, tagline, badge, price (in MXN — the base currency), what's included, and its photo. VIP is priced on request; leave its price at 0."
      />

      <div className="space-y-5">
        {value.packages.map((p, i) => (
          <Card key={p.id} title={p.name}>
            <div className="grid gap-5 md:grid-cols-[240px_1fr]">
              <ImagePicker label="Photo" src={p.photo} onPick={(url) => setPkg(i, "photo", url)} />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" value={p.name} onChange={(v) => setPkg(i, "name", v)} />
                  <Field label="Tagline" value={p.tagline} onChange={(v) => setPkg(i, "tagline", v)} />
                  <Field label="Badge" value={p.badge} onChange={(v) => setPkg(i, "badge", v)} />
                  <Field
                    label="Price (per person)"
                    type="number"
                    prefix="$"
                    suffix="MXN"
                    value={p.price}
                    onChange={(v) => setPkg(i, "price", Number(v) || 0)}
                  />
                </div>
                <TextArea
                  label="What's included (one per line)"
                  value={p.includes}
                  onChange={(v) => setPkg(i, "includes", v)}
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

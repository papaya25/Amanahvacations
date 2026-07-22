"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar, TextArea } from "../AdminUI";

type Tier = { label: string; price: number };
type Transfers = {
  enabled: boolean;
  perPerson: number;
  tiers: Tier[];
  conditions: string;
};

const DEFAULT: Transfers = {
  enabled: true,
  perPerson: 0,
  tiers: [
    { label: "1–4 people (round trip)", price: 0 },
    { label: "5–8 people (round trip)", price: 0 },
    { label: "9+ people (round trip)", price: 0 },
  ],
  conditions:
    "Private transfer between Cancún International Airport and your hotel or villa in the Riviera Maya. Meet & greet inside the terminal, flight tracking, air-conditioned van, cold water on board. Child seats on request. Final price confirmed by destination and group size.",
};

export default function TransfersAdmin() {
  const { value, setValue, save, savedAt } = useLocalState<Transfers>("admin_transfers", DEFAULT);
  const setTier = (i: number, p: Partial<Tier>) =>
    setValue({ ...value, tiers: value.tiers.map((t, j) => (j === i ? { ...t, ...p } : t)) });
  const addTier = () => setValue({ ...value, tiers: [...value.tiers, { label: "", price: 0 }] });
  const removeTier = (i: number) =>
    setValue({ ...value, tiers: value.tiers.filter((_, j) => j !== i) });

  return (
    <>
      <PageHead
        eyebrow="Commerce"
        title="Airport Transfers"
        desc="Pricing and conditions for private airport transfers — shown on the Airport Transfers page and offered as an add-on at checkout. Prices in MXN; leave 0 for 'quoted by our team'."
      />

      <div className="space-y-5">
        <Card>
          <label className="flex items-center gap-2.5 text-[14px] font-medium text-ink">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(e) => setValue({ ...value, enabled: e.target.checked })}
              className="h-4 w-4 accent-forest"
            />
            Offer airport transfers on the site (page + checkout add-on)
          </label>
        </Card>

        <Card title="Pricing" desc="Set a per-person rate, group rates, or both. Anything left at 0 shows as 'quoted personally'.">
          <div className="max-w-[280px]">
            <Field
              label="Per person (round trip)"
              type="number"
              prefix="$"
              suffix="MXN"
              value={value.perPerson}
              onChange={(v) => setValue({ ...value, perPerson: Number(v) || 0 })}
            />
          </div>
          <div className="mt-5 space-y-2.5">
            {value.tiers.map((t, i) => (
              <div key={i} className="grid items-end gap-3 rounded-xl border border-sand bg-cream/40 p-3 sm:grid-cols-[1fr_150px_auto]">
                <Field label="Group" value={t.label} onChange={(v) => setTier(i, { label: v })} placeholder="1–4 people (round trip)" />
                <Field label="Price" type="number" prefix="$" value={t.price} onChange={(v) => setTier(i, { price: Number(v) || 0 })} />
                <button
                  onClick={() => removeTier(i)}
                  className="h-[42px] self-end rounded-lg border border-sand px-3 text-[12px] text-sage transition hover:border-terracotta hover:text-terracotta"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTier}
            className="mt-3 rounded-full border-[1.5px] border-forest px-4 py-1.5 text-[12.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
          >
            + Add group rate
          </button>
        </Card>

        <Card title="Conditions & description">
          <TextArea
            label="Shown to customers"
            value={value.conditions}
            onChange={(v) => setValue({ ...value, conditions: v })}
            rows={5}
          />
        </Card>
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}

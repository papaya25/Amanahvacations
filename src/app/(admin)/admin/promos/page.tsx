"use client";

import { useDbState } from "@/lib/useDbState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type PromoCategory = "package" | "tour" | "activity";

type Promo = {
  code: string;
  type: "pct" | "flat";
  value: number;
  label: string;
  active: boolean;
  /** Minimum eligible-items subtotal (MXN); 0 = no minimum. */
  minSpend?: number;
  /** Minimum group size; 0 = no minimum. */
  minPeople?: number;
  /** Categories the code applies to; empty = all. */
  cats?: PromoCategory[];
};

const CATEGORIES: { id: PromoCategory; label: string }[] = [
  { id: "package", label: "Packages" },
  { id: "tour", label: "Tours" },
  { id: "activity", label: "Activities & add-ons" },
];

const DEFAULT: { promos: Promo[] } = {
  promos: [
    { code: "AMANAH10", type: "pct", value: 10, label: "10% off", active: true },
    { code: "WELCOME500", type: "flat", value: 500, label: "$500 MXN off", active: true },
  ],
};

export default function PromosAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState("admin_promos", DEFAULT);
  const setPromo = (i: number, k: keyof Promo, v: string | number | boolean) =>
    setValue({ ...value, promos: value.promos.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });
  // Ticking/unticking a category; an empty selection means "all categories".
  const toggleCat = (i: number, cat: PromoCategory) =>
    setValue({
      ...value,
      promos: value.promos.map((p, j) => {
        if (j !== i) return p;
        const cats = p.cats?.length ? p.cats : [];
        return {
          ...p,
          cats: cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat],
        };
      }),
    });
  const add = () =>
    setValue({ ...value, promos: [...value.promos, { code: "", type: "pct", value: 10, label: "", active: true }] });
  const remove = (i: number) => setValue({ ...value, promos: value.promos.filter((_, j) => j !== i) });

  return (
    <>
      <PageHead
        eyebrow="Commerce"
        title="Promo Codes"
        desc="Discount codes customers can enter at checkout. Percentage codes take a % off; fixed codes take a set amount (in MXN) off. Each code can carry conditions: a minimum spend, a minimum group size, and which categories it applies to — the discount is computed over the eligible items only."
      />

      <Card>
        <div className="space-y-3">
          {value.promos.map((p, i) => (
            <div key={i} className="rounded-xl border border-sand bg-cream/40 p-3">
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_120px_120px_1fr_auto_auto]">
              <Field label="Code" value={p.code} onChange={(v) => setPromo(i, "code", v.toUpperCase())} />
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest">Type</span>
                <select
                  value={p.type}
                  onChange={(e) => setPromo(i, "type", e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-sand bg-cream px-3 py-2.5 text-[14px] text-ink outline-none focus:border-forest"
                >
                  <option value="pct">% off</option>
                  <option value="flat">MXN off</option>
                </select>
              </label>
              <Field
                label="Value"
                type="number"
                value={p.value}
                onChange={(v) => setPromo(i, "value", Number(v) || 0)}
                suffix={p.type === "pct" ? "%" : "MXN"}
              />
              <Field label="Label" value={p.label} onChange={(v) => setPromo(i, "label", v)} placeholder="10% off" />
              <label className="flex h-[42px] items-center gap-2 whitespace-nowrap text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) => setPromo(i, "active", e.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                Active
              </label>
              <button
                onClick={() => remove(i)}
                className="h-[42px] rounded-xl border border-sand px-3 text-[12px] font-medium text-sage transition hover:border-terracotta hover:text-terracotta"
              >
                Remove
              </button>
            </div>

            {/* Conditions — all optional; leave at 0 / all unticked for a
                code that applies to everything with no minimums. */}
            <div className="mt-3 grid items-end gap-3 border-t border-sand/70 pt-3 sm:grid-cols-[150px_150px_1fr]">
              <Field
                label="Min spend"
                type="number"
                value={p.minSpend ?? 0}
                onChange={(v) => setPromo(i, "minSpend", Math.max(0, Number(v) || 0))}
                suffix="MXN"
              />
              <Field
                label="Min people"
                type="number"
                value={p.minPeople ?? 0}
                onChange={(v) => setPromo(i, "minPeople", Math.max(0, Number(v) || 0))}
                suffix="guests"
              />
              <div>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[1.2px] text-forest">
                  Applies to {!p.cats?.length && <span className="font-normal normal-case tracking-normal text-sage">(none ticked = everything)</span>}
                </span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const on = Boolean(p.cats?.includes(c.id));
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCat(i, c.id)}
                        className={`rounded-full border-[1.5px] px-3.5 py-2 text-[12.5px] font-medium transition ${
                          on
                            ? "border-forest bg-forest text-white"
                            : "border-sand bg-cream text-ink hover:border-forest/40"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>
        <button
          onClick={add}
          className="mt-4 rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          + Add promo code
        </button>
      </Card>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

"use client";

import { useDbState } from "@/lib/useDbState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type CostRow = { id: string; name: string; category: string; cost: number };

const seed = (names: [string, string][], category: string): CostRow[] =>
  names.map(([id, name]) => ({ id, name, category, cost: 0 }));

const DEFAULT: { rows: CostRow[]; taxRate: number } = {
  taxRate: 30,
  rows: [
    ...seed(
      [
        ["basic", "The Basics"],
        ["family", "Family Tour"],
        ["water", "Water Lovers"],
        ["explorer", "Indiana Jones"],
        ["honeymoon", "Honeymoon Escape"],
      ],
      "Package"
    ),
    ...seed(
      [
        ["akumalcenotes", "Cenotes, Coral & Sea Turtles"],
        ["tulumcenotes", "Cenotes & the Ruins of Tulum"],
        ["cobacenotes", "Coba Ruins & Jungle Cenotes"],
        ["cozumel", "Cozumel Private Boat Snorkeling"],
        ["akumaltulum", "Tulum & Akumal"],
        ["chichen", "Chichen Itza & Valladolid"],
        ["rutacenotes", "Ruta de Cenotes"],
        ["holbox", "Holbox Island Overnight Escape"],
        ["contoy", "Isla Contoy National Park"],
      ],
      "Tour"
    ),
    ...seed(
      [
        ["xcaret", "Xcaret Park"],
        ["xelha", "Xel-Há Park"],
        ["xplor", "Xplor Park"],
        ["xplorfuego", "Xplor Fuego"],
        ["xsenses", "Xenses Park"],
        ["monkey", "Monkey Sanctuary"],
        ["aquarium", "Cancún Aquarium"],
        ["cenotevisit", "Cenote Visit"],
        ["quinta", "Quinta Av Guided Tour"],
        ["cancun-city", "Cancún City Tour"],
      ],
      "Add-on"
    ),
    // Transfer costs are per group size tier (round trip), matching how
    // transfers are actually priced.
    ...seed(
      [
        ["transfer-1-4", "Airport Transfer — 1–4 people (round trip)"],
        ["transfer-5-8", "Airport Transfer — 5–8 people (round trip)"],
        ["transfer-9plus", "Airport Transfer — 9+ people (round trip)"],
      ],
      "Transfer"
    ),
  ],
};

const blankRow = (category = "Other"): CostRow => ({
  id: `cost-${Date.now()}`,
  name: "",
  category,
  cost: 0,
});

const CATEGORIES = ["Package", "Tour", "Add-on", "Transfer", "Other"];

export default function CostsAdmin() {
  const { value, setValue, save, savedAt, saving, error } = useDbState("admin_costs", DEFAULT);
  const patch = (i: number, p: Partial<CostRow>) =>
    setValue({ ...value, rows: value.rows.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  const add = (category: string) =>
    setValue({ ...value, rows: [...value.rows, blankRow(category)] });
  const remove = (i: number) => setValue({ ...value, rows: value.rows.filter((_, j) => j !== i) });

  return (
    <>
      <PageHead
        eyebrow="Finance"
        title="Costs"
        desc="Your cost per person (in MXN) for each item you sell. This feeds the profit dashboard (revenue − costs = profit, before and after tax) once the backend and real sales data are connected. Only you see this."
      />

      <div className="space-y-5">
        <Card title="Tax rate">
          <div className="max-w-[200px]">
            <Field
              label="Corporate tax"
              type="number"
              suffix="%"
              value={value.taxRate}
              onChange={(v) => setValue({ ...value, taxRate: Number(v) || 0 })}
            />
          </div>
          <p className="mt-2 text-[12px] text-sage">
            Used to show profit after tax on the dashboard (default 30%).
          </p>
        </Card>

        {CATEGORIES.map((cat) => {
          const rows = value.rows
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => r.category === cat);
          return (
            <Card key={cat} title={`${cat} costs`}>
              <div className="space-y-2.5">
                {rows.map(({ r, i }) => (
                  <div
                    key={r.id}
                    className="grid items-end gap-3 rounded-xl border border-sand bg-cream/40 p-3 sm:grid-cols-[1fr_160px_auto]"
                  >
                    <Field label="Item" value={r.name} onChange={(v) => patch(i, { name: v })} />
                    <Field
                      label={cat === "Transfer" ? "Cost / group" : "Cost / person"}
                      type="number"
                      prefix="$"
                      suffix="MXN"
                      value={r.cost}
                      onChange={(v) => patch(i, { cost: Number(v) || 0 })}
                    />
                    <button
                      onClick={() => remove(i)}
                      className="h-[42px] self-end rounded-lg border border-sand px-3 text-[12px] text-sage transition hover:border-terracotta hover:text-terracotta"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {rows.length === 0 && (
                  <p className="text-[12.5px] text-sage">No items yet — add one below.</p>
                )}
              </div>
              <button
                onClick={() => add(cat)}
                className="mt-3 rounded-full border-[1.5px] border-forest px-4 py-1.5 text-[12.5px] font-semibold text-forest transition hover:bg-forest hover:text-white"
              >
                + Add {cat === "Other" ? "cost item" : `${cat.toLowerCase()} cost`}
              </button>
            </Card>
          );
        })}
      </div>

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

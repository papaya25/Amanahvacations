"use client";

/* Monthly commission ledger. Automatic rows come from orders (server-
   computed); manual rows (TutCasa referrals that didn't book through the
   website) are admin-managed and stored in the private site_content
   "commission_entries" key. Rates: tours/activities 5% (≤2 people) / 10%
   (3+); stays 10% to Amanah. */

import { useMemo } from "react";
import { useDbState } from "@/lib/useDbState";
import { Card, Field, SaveBar } from "../AdminUI";
import { tourRatePct, type OwedToRow, type OwedByRow } from "./shared";

type ManualEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  desc: string;
  amountMXN: number;
  people: number;
};

const DEFAULT: { entries: ManualEntry[] } = { entries: [] };

const fmtMXN = (n: number) => `$${Math.round(n).toLocaleString("en-US")} MXN`;
const fmtUSD = (n: number) => `$${Math.round(n).toLocaleString("en-US")} USD`;
const monthLabel = (m: string) =>
  new Date(m + "-01T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function CommissionsClient({
  owedTo,
  owedBy,
  rateUSD,
}: {
  owedTo: OwedToRow[];
  owedBy: OwedByRow[];
  rateUSD: number;
}) {
  const { value, setValue, save, savedAt, saving, error } = useDbState("admin_commission_entries", DEFAULT);

  const addEntry = () =>
    setValue({
      entries: [
        ...value.entries,
        {
          id: `m-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          desc: "",
          amountMXN: 0,
          people: 2,
        },
      ],
    });
  const setEntry = (id: string, patch: Partial<ManualEntry>) =>
    setValue({ entries: value.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const removeEntry = (id: string) =>
    setValue({ entries: value.entries.filter((e) => e.id !== id) });

  /* Merge automatic + manual "owed to TutCasa" rows and group everything by
     month (newest month first). */
  const months = useMemo(() => {
    type MonthBucket = {
      owedTo: (OwedToRow & { manual?: boolean; manualId?: string })[];
      owedBy: OwedByRow[];
    };
    const map = new Map<string, MonthBucket>();
    const bucket = (m: string) => {
      if (!map.has(m)) map.set(m, { owedTo: [], owedBy: [] });
      return map.get(m)!;
    };
    owedTo.forEach((r) => bucket(r.month).owedTo.push(r));
    owedBy.forEach((r) => bucket(r.month).owedBy.push(r));
    value.entries
      .filter((e) => e.date && e.amountMXN > 0)
      .forEach((e) => {
        const ratePct = tourRatePct(Math.max(1, e.people));
        bucket(e.date.slice(0, 7)).owedTo.push({
          month: e.date.slice(0, 7),
          date: e.date,
          orderId: "manual",
          title: e.desc || "Manual entry",
          people: Math.max(1, e.people),
          amountMXN: e.amountMXN,
          ratePct,
          commissionMXN: Math.round((e.amountMXN * ratePct) / 100),
          manual: true,
          manualId: e.id,
        });
      });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [owedTo, owedBy, value.entries]);

  return (
    <>
      {/* Manual entries editor */}
      <Card>
        <h2 className="mb-1 font-serif text-[20px] font-semibold text-ink">
          Manual TutCasa referrals (booked outside the website)
        </h2>
        <p className="mb-4 text-[12.5px] text-sage">
          Tours or activities TutCasa sent you that were arranged by WhatsApp/phone instead of the
          website. Commission uses the same rule: 5% for up to 2 people, 10% for 3 or more.
        </p>
        <div className="space-y-3">
          {value.entries.map((e) => (
            <div key={e.id} className="grid items-end gap-3 rounded-xl border border-sand bg-cream/40 p-3 sm:grid-cols-[150px_1fr_140px_110px_110px_auto]">
              <Field label="Date" type="date" value={e.date} onChange={(v) => setEntry(e.id, { date: v })} />
              <Field label="Description" value={e.desc} onChange={(v) => setEntry(e.id, { desc: v })} placeholder="e.g. Chichén tour — guest from Casa Selva" />
              <Field label="Amount" type="number" value={e.amountMXN} onChange={(v) => setEntry(e.id, { amountMXN: Number(v) || 0 })} suffix="MXN" />
              <Field label="People" type="number" value={e.people} onChange={(v) => setEntry(e.id, { people: Math.max(1, Number(v) || 1) })} />
              <div className="pb-2 text-[13px] text-ink">
                {tourRatePct(Math.max(1, e.people))}% = <strong>{fmtMXN((e.amountMXN * tourRatePct(Math.max(1, e.people))) / 100)}</strong>
              </div>
              <button
                onClick={() => removeEntry(e.id)}
                className="h-[42px] rounded-xl border border-sand px-3 text-[12px] font-medium text-sage transition hover:border-terracotta hover:text-terracotta"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addEntry}
          className="mt-4 rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          + Add referral
        </button>
      </Card>

      {/* Monthly ledger */}
      {months.length === 0 ? (
        <Card>
          <p className="text-[13.5px] italic text-sage">
            No commission activity yet — TutCasa-referred bookings and paid TutCasa stays will appear
            here automatically.
          </p>
        </Card>
      ) : (
        months.map(([month, b]) => {
          const owedToTotal = b.owedTo.reduce((s, r) => s + r.commissionMXN, 0);
          const owedByTotalUSD = b.owedBy.reduce((s, r) => s + r.commissionUSD, 0);
          const owedByTotalMXN = b.owedBy.reduce((s, r) => s + r.commissionMXN, 0);
          const net = owedByTotalMXN - owedToTotal;
          return (
            <Card key={month}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-[22px] font-semibold text-ink">{monthLabel(month)}</h2>
                <div className={`text-[13.5px] font-semibold ${net >= 0 ? "text-forest" : "text-terracotta"}`}>
                  {net >= 0
                    ? `Net: TutCasa pays us ${fmtMXN(net)}`
                    : `Net: we pay TutCasa ${fmtMXN(-net)}`}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* We owe TutCasa */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-terracotta">
                    We owe TutCasa — {fmtMXN(owedToTotal)}
                  </p>
                  {b.owedTo.length === 0 ? (
                    <p className="text-[12.5px] italic text-sage">No referred tours this month.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {b.owedTo.map((r, i) => (
                        <div key={r.manualId ?? `${r.orderId}-${i}`} className="flex items-baseline justify-between gap-3 rounded-lg bg-cream/60 px-3 py-2 text-[12.5px]">
                          <span className="min-w-0 truncate text-ink">
                            {r.date} · <strong>{r.title}</strong> · {r.people}p
                            {r.manual ? " · manual" : ` · ${r.orderId}`}
                          </span>
                          <span className="shrink-0 text-ink">
                            {fmtMXN(r.amountMXN)} × {r.ratePct}% = <strong>{fmtMXN(r.commissionMXN)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TutCasa owes us */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-forest">
                    TutCasa owes us — {fmtUSD(owedByTotalUSD)} (≈ {fmtMXN(owedByTotalMXN)})
                  </p>
                  {b.owedBy.length === 0 ? (
                    <p className="text-[12.5px] italic text-sage">No paid stays this month.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {b.owedBy.map((r, i) => (
                        <div key={`${r.orderId}-${i}`} className="flex items-baseline justify-between gap-3 rounded-lg bg-cream/60 px-3 py-2 text-[12.5px]">
                          <span className="min-w-0 truncate text-ink">
                            {r.date} · <strong>{r.title}</strong> · {r.guest} · {r.orderId}
                          </span>
                          <span className="shrink-0 text-ink">
                            {fmtUSD(r.amountUSD)} × 10% = <strong>{fmtUSD(r.commissionUSD)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-sage">USD ≈ MXN at {rateUSD} (your configured rate).</p>
            </Card>
          );
        })
      )}

      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} />
    </>
  );
}

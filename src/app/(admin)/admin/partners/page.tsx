"use client";

/* Partners & affiliates: who sends us clients (and earns commission), who
   performs services for us, and what we bill partners per airport transfer.
   Stored privately in site_content "partners"; read by the booking forms and
   by Accounting. */

import { useDbState } from "@/lib/useDbState";
import { BLANK_PARTNER, DEFAULT_PARTNERS, type Partner } from "@/lib/accounting";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

const SITE = "https://amanahvacations.com";

export default function PartnersPage() {
  const { value, setValue, save, savedAt, saving, error, loaded } = useDbState("partners", { list: DEFAULT_PARTNERS });
  const list = value.list;
  const set = (id: string, patch: Partial<Partner>) =>
    setValue({ list: list.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const add = () => {
    const id = `p-${Date.now()}`;
    setValue({ list: [...list, { ...BLANK_PARTNER, id, name: "New partner" }] });
  };
  const remove = (id: string) => setValue({ list: list.filter((p) => p.id !== id) });
  const num = (v: string) => Number(v) || 0;

  return (
    <>
      <PageHead
        eyebrow="Business"
        title="Partners & Affiliates"
        desc="Affiliates send you clients and earn a commission on tours, packages and parks. Providers perform services for you (drivers, guides). One partner can be both. These names appear in the booking forms and in Accounting."
      />
      {!loaded && <p className="mb-4 text-[13px] text-sage">Loading…</p>}
      {list.map((p) => (
        <Card key={p.id} title={p.name || "Partner"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Name" value={p.name} onChange={(v) => set(p.id, { name: v })} />
            <Field label="Other spellings" value={p.aliases} onChange={(v) => set(p.id, { aliases: v })} placeholder="JF Tours, Riviera Tours" />
            <label className="flex items-center gap-2 pt-6 text-[13.5px] text-ink">
              <input type="checkbox" className="h-4 w-4 accent-forest" checked={p.affiliate} onChange={(e) => set(p.id, { affiliate: e.target.checked })} />
              Affiliate (sends clients)
            </label>
            <label className="flex items-center gap-2 pt-6 text-[13.5px] text-ink">
              <input type="checkbox" className="h-4 w-4 accent-forest" checked={p.provider} onChange={(e) => set(p.id, { provider: e.target.checked })} />
              Provider (does services)
            </label>
          </div>

          {p.affiliate && (
            <div className="mt-4 grid gap-4 rounded-xl bg-cream/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Field
                  label="Referral code"
                  value={p.code}
                  onChange={(v) => set(p.id, { code: v.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="e.g. tutcasa"
                />
                {p.code && <p className="mt-1 break-all text-[11.5px] text-sage">Their link: {SITE}/?ref={p.code}</p>}
              </div>
              <Field label="Commission" type="number" suffix="%" value={p.commissionPct} onChange={(v) => set(p.id, { commissionPct: num(v) })} />
              <Field label="Commission for bigger groups" type="number" suffix="%" value={p.commissionPctGroup} onChange={(v) => set(p.id, { commissionPctGroup: num(v) })} placeholder="same" />
              <Field label="…from this many people" type="number" suffix="people" value={p.commissionGroupFrom} onChange={(v) => set(p.id, { commissionGroupFrom: num(v) })} />
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="We bill them per airport transfer" type="number" prefix="$" suffix="MXN" value={p.transferSmall} onChange={(v) => set(p.id, { transferSmall: num(v) })} placeholder="not a transfer client" />
            <Field label="…for bigger groups" type="number" prefix="$" suffix="MXN" value={p.transferLarge} onChange={(v) => set(p.id, { transferLarge: num(v) })} />
            <Field label="…from this many people" type="number" suffix="people" value={p.transferLargeFrom} onChange={(v) => set(p.id, { transferLargeFrom: num(v) })} />
            <Field label="Contact" value={p.contact} onChange={(v) => set(p.id, { contact: v })} placeholder="WhatsApp / email" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Opening balance (+ they owe you)" type="number" prefix="$" suffix="MXN" value={p.openingBalance} onChange={(v) => set(p.id, { openingBalance: num(v) })} />
            <Field label="Balance counted from" type="date" value={p.openingDate} onChange={(v) => set(p.id, { openingDate: v })} />
            <div className="lg:col-span-2">
              <Field label="Notes" value={p.notes} onChange={(v) => set(p.id, { notes: v })} />
            </div>
          </div>

          <button
            onClick={() => confirm(`Remove ${p.name}? Past bookings keep their name.`) && remove(p.id)}
            className="mt-4 text-[12px] font-semibold text-sage hover:text-terracotta"
          >
            Remove partner
          </button>
        </Card>
      ))}
      <button onClick={add} className="mb-4 rounded-full border-[1.5px] border-forest px-5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest hover:text-white">
        + Add a partner
      </button>
      <SaveBar onSave={save} savedAt={savedAt} saving={saving} error={error} savedLabel="✓ Saved" idleLabel="Changes save privately — partners never see this page." />
    </>
  );
}

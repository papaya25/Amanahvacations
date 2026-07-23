import { cookies } from "next/headers";
import { PageHead } from "../AdminUI";
import { PROFITS_COOKIE, verifyProfitsToken } from "@/lib/adminAuth";
import { getSavedContent } from "@/lib/content/site";
import { fmtMXN, getAllOrders, isSale, type OrderRow } from "../dashboard-data";
import UnlockForm from "./UnlockForm";
import { lockProfits } from "./actions";
import type { CartItem } from "@/lib/cart";

export const dynamic = "force-dynamic";

type CostRow = { id: string; name: string; category: string; cost: number };
type CostsContent = { taxRate: number; rows: CostRow[] };

/** Cost of one booked item, from the admin's cost table (null = no cost set). */
function itemCost(item: CartItem, rows: CostRow[]): number | null {
  const byId = new Map(rows.map((r) => [r.id, r]));
  if (item.title === "Private Airport Transfer") {
    const tier =
      item.people <= 4 ? "transfer-1-4" : item.people <= 8 ? "transfer-5-8" : "transfer-9plus";
    const row = byId.get(tier);
    return row ? row.cost : null; // per group
  }
  const key = item.meta?.tour_key || item.meta?.pkgId || "";
  const row = byId.get(key);
  if (!row) return null;
  return row.cost * Math.max(1, item.people); // per person
}

export default async function ProfitsPage() {
  const jar = await cookies();
  const unlocked = await verifyProfitsToken(jar.get(PROFITS_COOKIE)?.value);

  if (!unlocked) {
    return (
      <>
        <PageHead eyebrow="Restricted" title="Profits" desc="Revenue, costs and profit — for your eyes only." />
        <UnlockForm />
      </>
    );
  }

  const [orders, costs] = await Promise.all([
    getAllOrders(),
    getSavedContent<CostsContent>("costs"),
  ]);
  const rows = costs?.rows ?? [];
  const taxRate = costs?.taxRate ?? 30;
  const sales = orders.filter(isSale);

  let revenue = 0;
  let totalCost = 0;
  const missing = new Set<string>();
  const perMonth = new Map<string, { revenue: number; cost: number }>();

  const orderCost = (o: OrderRow) => {
    let c = 0;
    for (const it of o.items) {
      const ic = itemCost(it, rows);
      if (ic === null) {
        if (it.total > 0) missing.add(it.title);
      } else {
        c += ic;
      }
    }
    return c;
  };

  for (const o of sales) {
    const c = orderCost(o);
    revenue += o.total;
    totalCost += c;
    const key = o.created_at.slice(0, 7);
    const m = perMonth.get(key) ?? { revenue: 0, cost: 0 };
    m.revenue += o.total;
    m.cost += c;
    perMonth.set(key, m);
  }

  const profit = revenue - totalCost;
  const tax = profit > 0 ? Math.round((profit * taxRate) / 100) : 0;
  const afterTax = profit - tax;
  const months = [...perMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 12);
  const maxRev = Math.max(1, ...months.map(([, v]) => v.revenue));

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHead
          eyebrow="Restricted"
          title="Profits"
          desc={`Revenue minus your per-item costs (from the Costs section), before and after ${taxRate}% tax. Cancelled orders are excluded.`}
        />
        <form action={lockProfits}>
          <button
            type="submit"
            className="rounded-full border border-sand px-4 py-2 text-[12px] font-semibold text-sage transition hover:border-terracotta hover:text-terracotta"
          >
            🔒 Lock
          </button>
        </form>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Revenue", fmtMXN(revenue)],
          ["Costs", fmtMXN(totalCost)],
          ["Profit before tax", fmtMXN(profit)],
          [`Profit after ${taxRate}% tax`, fmtMXN(afterTax)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[16px] border border-sand bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-sage">{label}</div>
            <div className="mt-1.5 font-serif text-[24px] font-semibold leading-none text-ink">{value}</div>
          </div>
        ))}
      </div>

      {missing.size > 0 && (
        <div className="mt-4 rounded-[14px] border border-[#f0dfa0] bg-[#fffdf5] px-4 py-3 text-[12.5px] leading-[1.6] text-[#7a5a1e]">
          <strong>Costs missing for:</strong> {[...missing].join(", ")} — add them in the Costs
          section so profit is accurate.
        </div>
      )}

      <div className="mt-6 rounded-[18px] border border-sand bg-white p-5">
        <h2 className="mb-4 font-serif text-[20px] font-semibold text-ink">By month</h2>
        {months.length === 0 ? (
          <p className="text-[13px] text-sage">No sales yet — bars appear as bookings come in.</p>
        ) : (
          <div className="space-y-3">
            {months.map(([key, v]) => {
              const p = v.revenue - v.cost;
              return (
                <div key={key}>
                  <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                    <span className="font-semibold text-ink">
                      {new Date(`${key}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <span className="text-sage">
                      {fmtMXN(v.revenue)} revenue · {fmtMXN(v.cost)} costs ·{" "}
                      <strong className={p >= 0 ? "text-forest" : "text-terracotta"}>{fmtMXN(p)} profit</strong>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-forest to-gold"
                      style={{ width: `${Math.round((v.revenue / maxRev) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

import { cookies } from "next/headers";
import Link from "next/link";
import { PageHead } from "../AdminUI";
import { PROFITS_COOKIE, verifyProfitsToken } from "@/lib/adminAuth";
import { fmtMXN, getAllOrders, isSale, type OrderRow } from "../dashboard-data";
import {
  abandonedCheckouts,
  buildSalesStats,
  getCosts,
  getServiceMargins,
  type CostRow,
  type MarginRow,
  type SalesStats,
  type SoldLine,
} from "./profit-data";
import UnlockForm from "./UnlockForm";
import { lockProfits } from "./actions";
import type { CartItem } from "@/lib/cart";

export const dynamic = "force-dynamic";

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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "margins", label: "Service margins" },
  { id: "sales", label: "Sales stats" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default async function ProfitsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
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

  const { tab: rawTab } = await searchParams;
  const tab: TabId = (TABS.some((t) => t.id === rawTab) ? rawTab : "overview") as TabId;

  const [orders, costs] = await Promise.all([getAllOrders(), getCosts()]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHead
          eyebrow="Restricted"
          title="Profits"
          desc="Revenue, per-service margins and sales statistics. Only you see this."
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

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/profits?tab=${t.id}`}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              tab === t.id
                ? "bg-forest text-white"
                : "border border-sand bg-white text-ink hover:border-forest"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "overview" && <OverviewTab orders={orders} costRows={costs.rows} taxRate={costs.taxRate} />}
      {tab === "margins" && <MarginsTab />}
      {tab === "sales" && <SalesTab orders={orders} />}
    </>
  );
}

/* ── Tab 1 — Overview (unchanged numbers) ──────────────────────────────── */

function OverviewTab({
  orders,
  costRows,
  taxRate,
}: {
  orders: OrderRow[];
  costRows: CostRow[];
  taxRate: number;
}) {
  const sales = orders.filter(isSale);

  let revenue = 0;
  let totalCost = 0;
  const missing = new Set<string>();
  const perMonth = new Map<string, { revenue: number; cost: number }>();

  for (const o of sales) {
    let c = 0;
    for (const it of o.items) {
      const ic = itemCost(it, costRows);
      if (ic === null) {
        if (it.total > 0) missing.add(it.title);
      } else {
        c += ic;
      }
    }
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

/* ── Tab 2 — Per-service margins ───────────────────────────────────────── */

async function MarginsTab() {
  const rows = await getServiceMargins();
  const categories = ["Package", "Tour", "Add-on", "Transfer"] as const;

  const priced = rows.filter((r) => r.price !== null && r.cost !== null);
  const avgMargin =
    priced.length > 0
      ? Math.round(
          (priced.reduce((s, r) => s + (r.price! - r.cost!) / r.price!, 0) / priced.length) * 100
        )
      : null;
  const missingCosts = rows.filter((r) => r.price !== null && r.cost === null).length;

  return (
    <>
      <div className="mb-5 grid gap-3.5 sm:grid-cols-3">
        <StatCard label="Services listed" value={String(rows.length)} />
        <StatCard label="Average margin" value={avgMargin === null ? "—" : `${avgMargin}%`} />
        <StatCard label="Missing costs" value={String(missingCosts)} warn={missingCosts > 0} />
      </div>

      {missingCosts > 0 && (
        <div className="mb-5 rounded-[14px] border border-[#f0dfa0] bg-[#fffdf5] px-4 py-3 text-[12.5px] leading-[1.6] text-[#7a5a1e]">
          Items marked <strong>“cost?”</strong> have no cost set — fill them in the{" "}
          <Link href="/admin/costs" className="font-semibold underline underline-offset-2">
            Costs section
          </Link>{" "}
          and the margin appears here automatically.
        </div>
      )}

      <div className="space-y-6">
        {categories.map((cat) => {
          const list = rows.filter((r) => r.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat} className="overflow-hidden rounded-[18px] border border-sand bg-white">
              <div className="border-b border-sand bg-cream/50 px-5 py-3 font-serif text-[17px] font-semibold text-ink">
                {cat === "Add-on" ? "Add-ons" : `${cat}s`}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[1.2px] text-sage">
                      <th className="px-5 py-2.5 font-semibold">Service</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Your cost</th>
                      <th className="px-4 py-2.5 text-right font-semibold">You charge</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Profit</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <MarginTr key={`${r.category}-${r.name}`} r={r} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MarginTr({ r }: { r: MarginRow }) {
  const per = ` / ${r.unit}`;
  const profit = r.price !== null && r.cost !== null ? r.price - r.cost : null;
  const margin = profit !== null && r.price ? Math.round((profit / r.price) * 100) : null;
  const marginColor =
    margin === null ? "text-sage" : margin < 0 ? "text-terracotta" : margin < 20 ? "text-[#b8860b]" : "text-forest";
  return (
    <tr className="border-t border-sand/60">
      <td className="px-5 py-2.5 font-medium text-ink">{r.name}</td>
      <td className="px-4 py-2.5 text-right text-sage">
        {r.cost === null ? <span className="font-semibold text-terracotta">cost?</span> : fmtMXN(r.cost) + per}
      </td>
      <td className="px-4 py-2.5 text-right text-ink">
        {r.price === null ? "On request" : fmtMXN(r.price) + per}
      </td>
      <td className={`px-4 py-2.5 text-right font-semibold ${profit !== null && profit < 0 ? "text-terracotta" : "text-ink"}`}>
        {profit === null ? "—" : fmtMXN(profit)}
      </td>
      <td className={`px-5 py-2.5 text-right font-bold ${marginColor}`}>
        {margin === null ? "—" : `${margin}%`}
      </td>
    </tr>
  );
}

/* ── Tab 3 — Sales statistics ──────────────────────────────────────────── */

function SalesTab({ orders }: { orders: OrderRow[] }) {
  const stats: SalesStats = buildSalesStats(orders);
  const abandoned = abandonedCheckouts(orders);

  return (
    <>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Orders" value={String(stats.totalOrders)} />
        <StatCard label="Revenue" value={fmtMXN(stats.totalRevenue)} />
        <StatCard label="Avg order value" value={fmtMXN(stats.avgOrderValue)} />
        <StatCard label="Avg group size" value={stats.avgGroupSize ? `${stats.avgGroupSize} people` : "—"} />
        <StatCard
          label="Avg booking lead time"
          value={stats.avgLeadDays === null ? "—" : `${stats.avgLeadDays} days`}
          hint="How far ahead people book — useful for ad timing"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SoldTable title="Packages sold" lines={stats.packages} />
        <SoldTable title="Tours sold" lines={stats.tours} />
      </div>

      <div className="mt-6">
        <SoldTable
          title="Add-ons sold"
          lines={stats.addons}
          note={`Revenue estimated from catalogue prices (add-ons are charged inside the package total). Airport transfers requested at checkout: ${stats.transfersRequested}.`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[18px] border border-sand bg-white p-5">
          <h2 className="mb-3 font-serif text-[18px] font-semibold text-ink">Payment methods</h2>
          {stats.paymentSplit.length === 0 ? (
            <p className="text-[13px] text-sage">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.paymentSplit.map((p) => (
                <div key={p.method} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink">{p.method}</span>
                  <span className="font-semibold text-forest">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[18px] border border-sand bg-white p-5">
          <h2 className="mb-3 font-serif text-[18px] font-semibold text-ink">Promo codes used</h2>
          {stats.promoUse.length === 0 ? (
            <p className="text-[13px] text-sage">No promo codes used yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.promoUse.map((p) => (
                <div key={p.code} className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink">{p.code}</span>
                  <span className="text-sage">
                    {p.count}× · {fmtMXN(p.discount)} discounted
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Abandoned checkouts */}
      <div className="mt-6 overflow-hidden rounded-[18px] border border-sand bg-white">
        <div className="border-b border-sand bg-cream/50 px-5 py-3">
          <span className="font-serif text-[17px] font-semibold text-ink">
            Abandoned checkouts ({abandoned.length})
          </span>
          <p className="mt-0.5 text-[12px] text-sage">
            Started an online payment but never completed it — reach out with a promo code to win
            them back.
          </p>
        </div>
        {abandoned.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-sage">None right now — great!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[1.2px] text-sage">
                  <th className="px-5 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-4 py-2.5 font-semibold">Items</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Value</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {abandoned.map((o) => (
                  <AbandonedTr key={o.id} o={o} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AbandonedTr({ o }: { o: OrderRow }) {
  const wa = (o.customer_whatsapp ?? "").replace(/[^0-9]/g, "");
  const mailSubject = encodeURIComponent("Your Amanah Vacations booking — a little gift to finish it");
  const mailBody = encodeURIComponent(
    `Hello ${o.customer_name.split(" ")[0]},\n\nWe noticed you started booking with us (${o.id}) but didn't get to finish. We'd love to have you — here's a promo code for your booking: AMANAH10\n\nWarm regards,\nAmanah Vacations`
  );
  return (
    <tr className="border-t border-sand/60 align-top">
      <td className="whitespace-nowrap px-5 py-2.5 text-sage">
        {new Date(o.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
      </td>
      <td className="px-4 py-2.5">
        <div className="font-medium text-ink">{o.customer_name}</div>
        <div className="text-[12px] text-sage">{o.customer_email}</div>
      </td>
      <td className="max-w-[280px] px-4 py-2.5 text-sage">
        {o.items.map((it) => it.title).join(", ")}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-ink">{fmtMXN(o.total)}</td>
      <td className="whitespace-nowrap px-5 py-2.5 text-right">
        <a
          href={`mailto:${o.customer_email}?subject=${mailSubject}&body=${mailBody}`}
          className="mr-2 inline-block rounded-full border-[1.5px] border-forest px-3 py-1 text-[12px] font-semibold text-forest transition hover:bg-forest hover:text-white"
        >
          ✉️ Email
        </a>
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[#25D366] px-3 py-1 text-[12px] font-semibold text-white transition hover:brightness-105"
          >
            WhatsApp
          </a>
        )}
      </td>
    </tr>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────── */

function StatCard({ label, value, hint, warn }: { label: string; value: string; hint?: string; warn?: boolean }) {
  return (
    <div className={`rounded-[16px] border bg-white p-5 ${warn ? "border-[#f0dfa0]" : "border-sand"}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-sage">{label}</div>
      <div className={`mt-1.5 font-serif text-[24px] font-semibold leading-none ${warn ? "text-[#b8860b]" : "text-ink"}`}>
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[11.5px] leading-snug text-sage">{hint}</div>}
    </div>
  );
}

function SoldTable({ title, lines, note }: { title: string; lines: SoldLine[]; note?: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-sand bg-white">
      <div className="border-b border-sand bg-cream/50 px-5 py-3 font-serif text-[17px] font-semibold text-ink">
        {title}
      </div>
      {lines.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-sage">Nothing sold yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[1.2px] text-sage">
                <th className="px-5 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 text-right font-semibold">Sold</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                <th className="px-5 py-2.5 text-right font-semibold">Avg people</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.name} className="border-t border-sand/60">
                  <td className="px-5 py-2.5 font-medium text-ink">{l.name}</td>
                  <td className="px-4 py-2.5 text-right text-ink">{l.units}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-forest">{fmtMXN(l.revenue)}</td>
                  <td className="px-5 py-2.5 text-right text-sage">
                    {l.units ? Math.round((l.people / l.units) * 10) / 10 : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {note && <p className="border-t border-sand/60 px-5 py-3 text-[12px] leading-relaxed text-sage">{note}</p>}
    </div>
  );
}

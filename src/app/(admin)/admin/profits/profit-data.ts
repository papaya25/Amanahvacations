import "server-only";

/* Data builders for the Profits tabs: per-service margins (tab 2) and sales
   statistics (tab 3). Reads the same sources the site sells from, so the
   numbers always match what customers actually see. */

import { getSavedContent } from "@/lib/content/site";
import { getAllPackages } from "@/lib/content/packages";
import { getSavedTours } from "@/lib/content/tours";
import { getSavedAddons, getSavedTransfers } from "@/lib/content/addons";
import { TOURS } from "@/app/(public)/[locale]/tours/data";
import { ACTIVITIES } from "@/app/(public)/[locale]/packages/data";
import type { OrderRow } from "../dashboard-data";

export type CostRow = { id: string; name: string; category: string; cost: number };
export type CostsContent = { taxRate: number; rows: CostRow[] };

export async function getCosts(): Promise<CostsContent> {
  const saved = await getSavedContent<CostsContent>("costs");
  return { taxRate: saved?.taxRate ?? 30, rows: saved?.rows ?? [] };
}

/* Some catalogue ids differ from the ids used in the Costs editor. */
const COST_ID_ALIASES: Record<string, string> = {
  cancun: "cancun-city", // add-on "Cancún City Tour"
};

/* ── Tab 2: per-service margins ─────────────────────────────────────────── */

export type MarginRow = {
  category: "Package" | "Tour" | "Add-on" | "Transfer";
  name: string;
  unit: string; // what the price is per ("person", "group", ...)
  price: number | null; // effective selling price (offer wins); null = on request
  cost: number | null; // null = not set in the Costs section
};

export async function getServiceMargins(): Promise<MarginRow[]> {
  const [costs, pkgs, tours, addons, transfers] = await Promise.all([
    getCosts(),
    getAllPackages(),
    getSavedTours(),
    getSavedAddons(),
    getSavedTransfers(),
  ]);
  const costById = new Map(costs.rows.map((r) => [r.id, r.cost]));
  const costOf = (id: string): number | null => {
    const key = COST_ID_ALIASES[id] ?? id;
    const c = costById.get(key);
    return c === undefined || c === 0 ? null : c;
  };
  const effective = (price: number, offer?: number) =>
    offer && offer > 0 && offer < price ? offer : price;

  const rows: MarginRow[] = [];

  for (const p of pkgs ?? []) {
    rows.push({
      category: "Package",
      name: p.name,
      unit: "person",
      price: p.price > 0 ? effective(p.price, p.offer) : null,
      cost: costOf(p.id),
    });
  }

  const tourList =
    tours ??
    TOURS.map((t) => ({
      key: t.key ?? t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: t.name,
      price: t.price ?? 0,
      offer: t.offer ?? 0,
      onreq: !!t.onreq,
    }));
  for (const t of tourList) {
    rows.push({
      category: "Tour",
      name: t.name,
      unit: "person",
      price: t.onreq || t.price <= 0 ? null : effective(t.price, t.offer),
      cost: costOf(t.key),
    });
  }

  const addonList =
    addons ??
    ACTIVITIES.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price ?? 0,
      offer: 0,
      onRequest: a.price === null,
    }));
  for (const a of addonList) {
    rows.push({
      category: "Add-on",
      name: a.name,
      unit: "person",
      price: a.onRequest || a.price <= 0 ? null : effective(a.price, a.offer ?? 0),
      cost: costOf(a.id),
    });
  }

  const tierIds = ["transfer-1-4", "transfer-5-8", "transfer-9plus"];
  const tierNames = ["Airport Transfer — 1–4 people", "Airport Transfer — 5–8 people", "Airport Transfer — 9+ people"];
  const tiers = transfers?.tiers ?? [];
  tierIds.forEach((id, i) => {
    const sell = tiers[i]?.price;
    rows.push({
      category: "Transfer",
      name: tiers[i]?.label ? `Airport Transfer — ${tiers[i].label}` : tierNames[i],
      unit: "group",
      price: sell && sell > 0 ? sell : null,
      cost: costOf(id),
    });
  });

  return rows;
}

/* ── Tab 3: sales statistics ────────────────────────────────────────────── */

/** Orders that represent real sales for statistics: everything except
    cancelled orders and online payments that were never completed. */
export const isRealizedSale = (o: OrderRow) =>
  o.status !== "Cancelled" && o.status !== "Pending payment";

export type SoldLine = {
  name: string;
  units: number; // bookings containing it
  revenue: number; // MXN actually charged (0 for on-request items)
  people: number; // total travelers across bookings
};

export type SalesStats = {
  packages: SoldLine[];
  tours: SoldLine[];
  addons: SoldLine[]; // revenue is estimated from catalogue prices
  transfersRequested: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgGroupSize: number;
  avgLeadDays: number | null; // order date → travel date
  paymentSplit: { method: string; count: number }[];
  promoUse: { code: string; count: number; discount: number }[];
};

export function buildSalesStats(orders: OrderRow[]): SalesStats {
  const sales = orders.filter(isRealizedSale);

  const addonPrice = new Map(
    ACTIVITIES.filter((a) => a.price !== null).map((a) => [a.id, a.price as number])
  );
  const addonName = new Map(ACTIVITIES.map((a) => [a.id, a.name]));

  const bump = (map: Map<string, SoldLine>, key: string, name: string, revenue: number, people: number) => {
    const line = map.get(key) ?? { name, units: 0, revenue: 0, people: 0 };
    line.units += 1;
    line.revenue += revenue;
    line.people += people;
    map.set(key, line);
  };

  const pkgMap = new Map<string, SoldLine>();
  const tourMap = new Map<string, SoldLine>();
  const addonMap = new Map<string, SoldLine>();
  let transfersRequested = 0;
  let peopleTotal = 0;
  let peopleOrders = 0;
  const leadDays: number[] = [];
  const payment = new Map<string, number>();
  const promos = new Map<string, { count: number; discount: number }>();

  for (const o of sales) {
    payment.set(o.payment_method, (payment.get(o.payment_method) ?? 0) + 1);
    if (o.promo_code) {
      const p = promos.get(o.promo_code) ?? { count: 0, discount: 0 };
      p.count += 1;
      p.discount += o.discount;
      promos.set(o.promo_code, p);
    }

    let orderPeople = 0;
    for (const it of o.items) {
      const people = Math.max(1, it.people || 1);

      if (it.title === "Private Airport Transfer") {
        transfersRequested += 1;
        continue;
      }
      if (it.kind === "package" || it.meta?.pkgId && it.meta.pkgId !== "tour") {
        const key = it.meta?.pkgId || it.title;
        bump(pkgMap, key, it.title, it.total, people);
        orderPeople = Math.max(orderPeople, people);
        // Add-ons bought inside this package (ids stored on the item).
        const ids = (it.meta?.addon_ids ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s !== "None");
        for (const id of ids) {
          const est = (addonPrice.get(id) ?? 0) * people;
          bump(addonMap, id, addonName.get(id) ?? id, est, people);
        }
      } else if (it.kind === "tour" || it.meta?.tour_key) {
        const key = it.meta?.tour_key || it.title;
        bump(tourMap, key, it.title, it.total, people);
        orderPeople = Math.max(orderPeople, people);
      } else {
        bump(addonMap, it.title, it.title, it.total, people);
      }

      const travelRaw = it.meta?.date || it.meta?.checkin;
      if (travelRaw) {
        const travel = Date.parse(travelRaw);
        const placed = Date.parse(o.created_at);
        if (!Number.isNaN(travel) && !Number.isNaN(placed) && travel > placed) {
          leadDays.push(Math.round((travel - placed) / 864e5));
        }
      }
    }
    if (orderPeople > 0) {
      peopleTotal += orderPeople;
      peopleOrders += 1;
    }
  }

  const totalRevenue = sales.reduce((s, o) => s + o.total, 0);
  const byRevenue = (a: SoldLine, b: SoldLine) => b.revenue - a.revenue || b.units - a.units;

  return {
    packages: [...pkgMap.values()].sort(byRevenue),
    tours: [...tourMap.values()].sort(byRevenue),
    addons: [...addonMap.values()].sort(byRevenue),
    transfersRequested,
    totalOrders: sales.length,
    totalRevenue,
    avgOrderValue: sales.length ? Math.round(totalRevenue / sales.length) : 0,
    avgGroupSize: peopleOrders ? Math.round((peopleTotal / peopleOrders) * 10) / 10 : 0,
    avgLeadDays: leadDays.length
      ? Math.round(leadDays.reduce((s, d) => s + d, 0) / leadDays.length)
      : null,
    paymentSplit: [...payment.entries()]
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count),
    promoUse: [...promos.entries()]
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Online payments started but never completed, older than an hour — the
    "abandoned checkout" list, with contact details for a follow-up promo. */
export function abandonedCheckouts(orders: OrderRow[]) {
  const cutoff = Date.now() - 60 * 60 * 1000;
  return orders.filter(
    (o) => o.status === "Pending payment" && Date.parse(o.created_at) < cutoff
  );
}

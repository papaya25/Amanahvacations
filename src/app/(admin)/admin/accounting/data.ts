import "server-only";

/* Builds the accounting log: one row per service, from
   - orders (website checkouts, manual sales, TutCasa tour bookings) — a paid
     TutCasa stay inside an order becomes its own "Stay" row;
   - airport-transfer jobs (confirmed / done);
   - the book's manual entries (history imported from the spreadsheet).
   Each order/transfer can carry overrides in its `acct` column (edited from
   the log) — they always win over the automatic values. */

import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import type { CartItem } from "@/lib/cart";
import { PARKS } from "@/app/(public)/[locale]/parks/data";
import { getCosts, itemCost } from "../profits/profit-data";
import { getPublicContent } from "@/lib/content/site";
import { getPartners } from "@/lib/content/partners";
import {
  EMPTY_BOOK,
  commissionPctFor,
  countryFromPhone,
  estimateFee,
  matchPartner,
  partnerTransferRate,
  seatPax,
  parseStripeRef,
  transferCostId,
  type AcctOverrides,
  type AcctRow,
  type Book,
  type Partner,
  type ServiceType,
} from "@/lib/accounting";

async function readDoc<T>(key: string): Promise<T | null> {
  if (!adminConfigured) return null;
  const { data } = await createAdminClient().from("site_content").select("data").eq("key", key).maybeSingle();
  return (data?.data as T) ?? null;
}

export async function getBook(): Promise<Book> {
  return { ...EMPTY_BOOK, ...((await readDoc<Partial<Book>>("accounting")) ?? {}) };
}

type OrderRaw = {
  id: string;
  created_at: string;
  status: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  customer_name: string;
  customer_whatsapp: string | null;
  referrer: string | null;
  source: string | null;
  acct: AcctOverrides | null;
};

type TransferRaw = {
  transfer_id: string;
  full_name: string;
  travel_date: string | null;
  flight_number: string | null;
  passengers: number | null;
  adults: number | null;
  kids: number | null;
  kids_ages: string | null;
  guest_phone: string | null;
  home: string | null;
  status: string;
  provider: string | null;
  price: number | null;
  payment_method: string | null;
  kind: string | null;
  acct: AcctOverrides | null;
};

const pad = (n: number) => String(n).padStart(2, "0");
/** "2026-10-29" or "August 26, 2026" → YYYY-MM-DD; falls back to the order date. */
function isoDay(raw: string | undefined, fallback: string): string {
  if (raw) {
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    const t = new Date(raw);
    if (!Number.isNaN(+t)) return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  }
  return fallback.slice(0, 10);
}

const PARK_IDS = new Set(PARKS.map((p) => p.id));
const isFeeLine = (it: CartItem) => it.title.startsWith("Card payment fee");
const isTransferLine = (it: CartItem) => it.title === "Private Airport Transfer";

function serviceOf(items: CartItem[]): ServiceType {
  const main = items.filter((it) => !isFeeLine(it));
  if (main.some((it) => it.kind === "package" || (it.meta?.pkgId && it.meta.pkgId !== "tour"))) return "Package";
  if (main.some((it) => it.kind === "tour" || it.meta?.tour_key)) return "Tour";
  if (main.some((it) => it.meta?.activity_id && PARK_IDS.has(it.meta.activity_id))) return "Park";
  if (main.some((it) => it.kind === "activity" && !isTransferLine(it))) return "Activity";
  if (main.some(isTransferLine)) return "Airport transfer";
  return "Other";
}

/** Same person/family across services: phone digits, else the name. */
const groupKeyOf = (phone: string | null | undefined, name: string) => {
  const d = (phone ?? "").replace(/\D/g, "");
  return d.length >= 7 ? `p${d.slice(-9)}` : `n${name.toLowerCase().replace(/[^a-z]/g, "")}`;
};

const COMMISSION_ON_COST_FROM = "2026-11-01";
const ONLINE_METHODS = new Set(["Credit / Debit Card", "Stripe", "PayPal", "Wise", "Mercado Pago"]);
const realizedOrder = (s: string) => s !== "Cancelled" && s !== "Pending payment";
const paidOnline = (o: OrderRaw) => o.source !== "manual" && o.status.startsWith("Paid");

/* ── Stripe: real fees instead of estimates ───────────────────────────────
   Website card payments: the PaymentIntent carries metadata.order_id (set at
   checkout), so one list call finds them. Manual Stripe charges: the admin
   pastes the payment id (pi_… / ch_…) on the row. Found fees are saved on the
   order (acct.fee + feeExact), so Stripe is asked only once per payment. */
type BT = { amount: number; fee: number; net: number };
function btOf(charge: unknown): BT | null {
  const bt = (charge as { balance_transaction?: unknown } | null)?.balance_transaction;
  return bt && typeof bt === "object" ? (bt as BT) : null;
}

async function syncStripeFees(orders: OrderRaw[]): Promise<void> {
  if (!stripeConfigured) return;
  // feeChecked: Stripe was already asked and had no match — don't ask on every page load (slow).
  const web = orders.filter((o) => o.payment_method === "Credit / Debit Card" && o.status.startsWith("Paid") && !o.acct?.feeExact && !o.acct?.feeChecked);
  const manual = orders.filter((o) => o.acct?.stripeRef && !o.acct?.feeExact);
  if (!web.length && !manual.length) return;
  const stripe = getStripe();
  const found = new Map<string, BT>();
  let listed = false; // only trust "no match" when Stripe actually answered
  const add = (id: string, bt: BT) => {
    const prev = found.get(id) ?? { amount: 0, fee: 0, net: 0 };
    found.set(id, { amount: prev.amount + bt.amount / 100, fee: prev.fee + bt.fee / 100, net: prev.net + bt.net / 100 });
  };
  try {
    if (web.length) {
      // ponytail: last 100 payments only — older unmatched orders keep the estimate.
      const list = await stripe.paymentIntents.list({ limit: 100, expand: ["data.latest_charge.balance_transaction"] });
      const wanted = new Set(web.map((o) => o.id));
      for (const pi of list.data) {
        const oid = pi.metadata?.order_id;
        const bt = btOf(pi.latest_charge);
        if (oid && wanted.has(oid) && pi.status === "succeeded" && bt) add(oid, bt);
      }
      listed = true;
    }
    for (const o of manual) {
      const ref = parseStripeRef(o.acct!.stripeRef);
      if (!ref) continue;
      const bt = ref.startsWith("pi_")
        ? btOf((await stripe.paymentIntents.retrieve(ref, { expand: ["latest_charge.balance_transaction"] })).latest_charge)
        : btOf(await stripe.charges.retrieve(ref, { expand: ["balance_transaction"] }));
      if (bt) add(o.id, bt);
    }
  } catch (e) {
    console.error("syncStripeFees:", e instanceof Error ? e.message : e);
  }
  const supabase = createAdminClient();
  // Older website payments Stripe doesn't list any more keep the estimate; remember that.
  for (const o of listed ? web : []) {
    if (found.has(o.id)) continue;
    o.acct = { ...(o.acct ?? {}), feeChecked: true };
    await supabase.from("orders").update({ acct: o.acct }).eq("id", o.id);
  }
  for (const [id, bt] of found) {
    const o = orders.find((x) => x.id === id)!;
    // amount = MXN Stripe actually charged (its own USD→MXN rate), before fees.
    o.acct = { ...(o.acct ?? {}), received: Math.round(bt.amount), fee: Math.round(bt.fee), net: Math.round(bt.net), feeExact: true };
    await supabase.from("orders").update({ acct: o.acct }).eq("id", id);
  }
}

export type AccountingData = {
  rows: AcctRow[];
  book: Book;
  partners: Partner[];
  rateUSD: number; // MXN per 1 USD (Currency & Rates)
  receiptUrls: Record<string, string>; // storage path → 1-hour private link
};

export async function getAccounting(): Promise<AccountingData> {
  const [partners, book, costs, cur] = await Promise.all([
    getPartners(),
    getBook(),
    getCosts(),
    getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 17.5, rateEUR: 19.5 }),
  ]);
  const rateUSD = cur.rateUSD > 0 ? cur.rateUSD : 17.5;
  if (!adminConfigured) return { rows: [], book, partners, rateUSD, receiptUrls: {} };
  const receiptPaths = [...book.payments, ...book.expenses].map((x) => x.receipt).filter((p): p is string => !!p);
  const receiptUrls: Record<string, string> = {};
  if (receiptPaths.length) {
    const { data } = await createAdminClient().storage.from("receipts").createSignedUrls(receiptPaths, 3600);
    data?.forEach((d) => {
      if (d.path && d.signedUrl) receiptUrls[d.path] = d.signedUrl;
    });
  }
  const supabase = createAdminClient();
  const [{ data: orderData }, { data: transferData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, status, items, total, payment_method, customer_name, customer_whatsapp, referrer, source, acct")
      .order("created_at", { ascending: true })
      .limit(5000),
    supabase
      .from("tutcasa_transfers")
      .select("transfer_id, full_name, travel_date, flight_number, passengers, adults, kids, kids_ages, guest_phone, home, status, provider, price, payment_method, kind, acct")
      .in("status", ["confirmed", "done"]),
  ]);
  // A TutCasa tour request isn't business until it's accepted.
  const orders = ((orderData ?? []) as OrderRaw[]).filter(
    (o) => realizedOrder(o.status) && !(o.source === "tutcasa" && o.status === "Pending confirmation")
  );
  await syncStripeFees(orders);

  const costById = new Map(costs.rows.map((r) => [r.id, r.cost]));
  const transferCost = (pax: number) => costById.get(transferCostId(pax)) || 0;
  const country = (override: string | undefined, phone: string | null | undefined) => {
    if (override) return { name: override, iso: override.slice(0, 2).toUpperCase() };
    return countryFromPhone(phone) ?? { name: "", iso: "XX" };
  };
  const affiliateOf = (source: string) => {
    const p = matchPartner(source, partners);
    return p?.affiliate ? p : null;
  };

  const rows: Omit<AcctRow, "groupId">[] = [];

  for (const o of orders) {
    const a = o.acct ?? {};
    const items = o.items ?? [];
    const paidStays = items.filter(
      (it) => it.kind === "stay" && (it.meta?.instant !== "0" || it.meta?.stay_status === "paid")
    );
    const rest = items.filter((it) => it.kind !== "stay");
    const people = Math.max(1, ...items.map((it) => it.people || 1));
    const ctry = country(a.country, o.customer_whatsapp);
    const referrerPartner = matchPartner(o.referrer, partners);
    const source =
      a.source ?? referrerPartner?.name ?? (o.source === "manual" ? "WhatsApp / direct" : "Website");
    const affiliate = affiliateOf(source);
    const method = a.method ?? o.payment_method;
    /* "Card" = the provider's own terminal: the client's 5% card fee goes to
       the provider's processor, never to us — it's neither our revenue nor our
       cost. (Cards WE charge go through Stripe / PayPal, where the 5% is ours.) */
    const passThrough = method === "Card" ? rest.filter(isFeeLine) : [];
    const passThroughTotal = passThrough.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const ours = rest.filter((it) => !passThrough.includes(it));
    const stayTotal = items.filter((it) => it.kind === "stay").reduce((s, it) => s + (Number(it.total) || 0), 0);
    // Pesos Stripe really charged (its exchange rate, not ours); older syncs saved only net + fee.
    const stripeGross = a.received ?? (a.feeExact && a.net ? a.net + (a.fee ?? 0) : 0);
    const orderFee = a.fee ?? (paidOnline(o) ? estimateFee(method, o.total) : 0);
    const common = {
      name: o.customer_name,
      phone: o.customer_whatsapp,
      groupKey: groupKeyOf(o.customer_whatsapp, o.customer_name),
      country: ctry.name,
      countryIso: ctry.iso,
      source,
      method,
      note: a.note ?? "",
      stripeRef: a.stripeRef ?? "",
    };
    const date = isoDay(
      rest[0]?.meta?.date || rest[0]?.meta?.checkin || items[0]?.meta?.date || items[0]?.meta?.checkin,
      o.created_at
    );

    if (ours.length) {
      const parts = (a.parts ?? []).filter((p) => p.partner && p.cost > 0);
      const provider = parts.length ? "Amanah" : a.provider ?? ours.find((it) => it.meta?.performed_by)?.meta?.performed_by ?? "";
      const providerPartner = matchPartner(provider, partners);
      const tourItems = rest.filter((it) => !isFeeLine(it) && !isTransferLine(it));
      // From Nov 2026 the affiliate's % is on OUR COST of the tour, before that on the price.
      const commissionBase =
        date >= COMMISSION_ON_COST_FROM
          ? a.cost ?? tourItems.reduce((s, it) => s + (itemCost(it, costs.rows) ?? 0), 0)
          : tourItems.reduce((s, it) => s + (Number(it.total) || 0), 0);
      rows.push({
        ...common,
        key: `o:${o.id}`,
        editable: true,
        date,
        people,
        service: serviceOf(rest),
        description: rest.filter((it) => !isFeeLine(it)).map((it) => it.title).join(" + "),
        affiliate: affiliate?.name ?? null,
        provider,
        // A partner who runs the tour (JF, Azul Riviera…) collects the client's
        // money themselves — unless we took it ourselves (Stripe / PayPal / Wise).
        collectedBy: a.collectedBy ?? (providerPartner?.provider && !ONLINE_METHODS.has(method) ? providerPartner.name : "Amanah"),
        charged: a.charged ?? (stripeGross && !paidStays.length ? stripeGross : o.total - stayTotal - passThroughTotal),
        cost: a.cost ?? ours.reduce((s, it) => s + (itemCost(it, costs.rows) ?? 0), 0),
        fee: orderFee,
        feeExact: Boolean(a.feeExact),
        parts,
        commission:
          a.commission ?? (affiliate ? Math.round((commissionBase * commissionPctFor(affiliate, people)) / 100) : 0),
      });
    }
    // Stays: we collect the full price and owe TutCasa all but our 10%.
    paidStays.forEach((it, i) => {
      const charged = Number(it.total) || 0;
      rows.push({
        ...common,
        key: `o:${o.id}#stay${i}`,
        editable: false,
        date: isoDay(it.meta?.checkin, o.created_at),
        people: Math.max(1, it.people || 1),
        service: "Stay",
        description: it.title,
        affiliate: null,
        provider: "TutCasa",
        collectedBy: "Amanah",
        charged,
        cost: Math.round(charged * 0.9),
        fee: ours.length || i > 0 ? 0 : orderFee,
        feeExact: Boolean(a.feeExact),
        commission: 0,
      });
    });
  }

  for (const t of (transferData ?? []) as TransferRaw[]) {
    const a = t.acct ?? {};
    const pushed = !t.transfer_id.startsWith("manual-");
    const pax = t.passengers ?? ((t.adults ?? 0) + (t.kids ?? 0) || 1);
    const source = a.source ?? (pushed ? "TutCasa" : "WhatsApp / direct");
    const srcPartner = matchPartner(source, partners);
    const billedRate = srcPartner ? partnerTransferRate(srcPartner, pax) : 0;
    const ctry = country(a.country, t.guest_phone);
    rows.push({
      key: `t:${t.transfer_id}`,
      editable: true,
      date: t.travel_date ?? "",
      name: t.full_name,
      phone: t.guest_phone,
      groupKey: groupKeyOf(t.guest_phone, t.full_name),
      country: ctry.name,
      countryIso: ctry.iso,
      people: pax,
      service: t.kind === "dropoff" ? "Airport drop-off" : "Airport pickup",
      description: [t.flight_number, t.home].filter(Boolean).join(" · "),
      source,
      affiliate: a.commission ? (srcPartner?.name ?? null) : null,
      provider: t.provider ?? "",
      // A partner we bill per transfer (TutCasa) collects from its guest and pays us.
      collectedBy: a.collectedBy ?? (billedRate > 0 ? srcPartner!.name : "Amanah"),
      charged: Number(t.price) || billedRate,
      method: t.payment_method ?? "",
      cost: a.cost ?? transferCost(seatPax(t)), // babies don't take a seat
      fee: a.fee ?? 0,
      feeExact: Boolean(a.feeExact),
      commission: a.commission ?? 0,
      note: a.note ?? "",
      stripeRef: a.stripeRef ?? "",
    });
  }

  for (const e of book.entries) {
    const ctry = country(e.country, e.phone);
    rows.push({
      key: `e:${e.id}`,
      editable: true,
      date: e.date,
      name: e.name,
      phone: e.phone || null,
      groupKey: e.group ? `g${e.group}` : groupKeyOf(e.phone, e.name),
      country: ctry.name,
      countryIso: ctry.iso,
      people: e.people,
      service: e.service,
      description: e.description,
      source: e.source,
      affiliate: affiliateOf(e.source)?.name ?? null,
      provider: e.provider,
      collectedBy: e.collectedBy || "Amanah",
      charged: e.charged,
      method: e.method,
      cost: e.cost,
      fee: e.fee,
      feeExact: false,
      commission: e.commission,
      note: e.note,
      stripeRef: "",
    });
  }

  // Group IDs ("CA001"): numbered per country in order of first service, per year.
  rows.sort((x, y) => x.date.localeCompare(y.date) || x.key.localeCompare(y.key));
  const ids = new Map<string, string>();
  const seq = new Map<string, number>();
  const out: AcctRow[] = rows.map((r) => {
    const yk = `${r.date.slice(0, 4)}|${r.groupKey}`;
    if (!ids.has(yk)) {
      const sk = `${r.date.slice(0, 4)}|${r.countryIso}`;
      const n = (seq.get(sk) ?? 0) + 1;
      seq.set(sk, n);
      ids.set(yk, `${r.countryIso}${String(n).padStart(3, "0")}`);
    }
    return { ...r, groupId: ids.get(yk)! };
  });
  return { rows: out, book, partners, rateUSD, receiptUrls };
}

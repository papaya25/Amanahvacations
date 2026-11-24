/* Accounting building blocks shared by the admin (server + client):
   partners & affiliates, phone → country, and the per-service profit math.
   Plain module — no server-only imports. */

/* ── Partners & affiliates (site_content "partners", private) ─────────── */

export type Partner = {
  id: string; // stable key; also the ?ref= code stamped on orders.referrer
  name: string;
  code: string; // what the partner shares: amanahvacations.com/?ref=<code>
  affiliate: boolean; // sends us clients → earns commission
  provider: boolean; // performs services for us → we owe them our cost
  aliases: string; // comma-separated other spellings ("JF Tours, Riviera Tours")
  /** Commission on tours / packages / parks: pct, or pctGroup from groupFrom people. */
  commissionPct: number;
  commissionPctGroup: number;
  commissionGroupFrom: number;
  /** What WE charge this partner per airport transfer (0 = not a transfer client). */
  transferSmall: number;
  transferLarge: number;
  transferLargeFrom: number; // people
  /** Balance carried over from before the system (+ = they owe us). */
  openingBalance: number;
  openingDate: string; // services/payments before this date are already in the opening balance
  contact: string;
  notes: string;
};

export const BLANK_PARTNER: Omit<Partner, "id" | "name"> = {
  code: "", affiliate: false, provider: true, aliases: "",
  commissionPct: 0, commissionPctGroup: 0, commissionGroupFrom: 3,
  transferSmall: 0, transferLarge: 0, transferLargeFrom: 4,
  openingBalance: 0, openingDate: "", contact: "", notes: "",
};

export const DEFAULT_PARTNERS: Partner[] = [
  {
    ...BLANK_PARTNER, id: "tutcasa", name: "TutCasa", code: "tutcasa", affiliate: true, provider: false,
    commissionPct: 5, commissionPctGroup: 10, commissionGroupFrom: 3,
    transferSmall: 1300, transferLarge: 1500, transferLargeFrom: 4,
  },
  { ...BLANK_PARTNER, id: "moussa", name: "Moussa" },
  { ...BLANK_PARTNER, id: "jf", name: "JF", aliases: "JF Tours, Riviera Tours" },
  { ...BLANK_PARTNER, id: "azul-riviera", name: "Azul Riviera" },
];

/** Where a client came from (besides partners, which are added to the list). */
export const SOURCES = ["Website", "WhatsApp / direct", "Mosque", "Connections", "Other"];

export const PAYMENT_METHODS = ["Cash", "Card", "Stripe", "PayPal", "Wise", "Bank transfer", "Other"];

const norm = (s: string) => s.toLowerCase().replace(/\btours?\b/g, "").replace(/[^a-z0-9]/g, "");

/** Find the partner a free-text name refers to (name, id, code or alias). */
export function matchPartner(name: string | null | undefined, partners: Partner[]): Partner | null {
  if (!name?.trim()) return null;
  const n = norm(name);
  if (!n) return null;
  return (
    partners.find((p) =>
      [p.name, p.id, p.code, ...p.aliases.split(",")].some((a) => a.trim() && norm(a) === n)
    ) ?? null
  );
}

export function commissionPctFor(p: Partner, people: number): number {
  return people >= p.commissionGroupFrom && p.commissionPctGroup > 0 ? p.commissionPctGroup : p.commissionPct;
}

/** What we bill a partner for one airport transfer (0 = no rate set). */
export function partnerTransferRate(p: Partner, people: number): number {
  return people >= p.transferLargeFrom && p.transferLarge > 0 ? p.transferLarge : p.transferSmall;
}

/* ── Airport transfers: who takes a seat ─────────────────────────────────
   Babies (under 2) don't count toward the group size for costing. Ages are
   free text from the forms ("1", "6 months", "baby", "5"). */
export function isBabyAge(age: string): boolean {
  const a = age.trim().toLowerCase();
  if (!a) return false;
  if (/month|mes|mois|baby|bebe|bébé|infant/.test(a)) return true;
  const n = Number(a.replace(",", ".").replace(/[^0-9.]/g, ""));
  return a.replace(/[^0-9]/g, "") !== "" && n < 2;
}

export function seatPax(t: { adults: number | null; kids: number | null; kids_ages: string | null; passengers: number | null }): number {
  const babies = (t.kids_ages ?? "").split(",").filter(isBabyAge).length;
  const total = t.adults != null || t.kids != null ? (t.adults ?? 0) + (t.kids ?? 0) : (t.passengers ?? 1);
  return Math.max(1, total - babies);
}

/** Cost-table row for a transfer of `pax` seated people. */
export function transferCostId(pax: number): string {
  if (pax <= 1) return "transfer-1";
  if (pax === 2) return "transfer-2";
  if (pax === 3) return "transfer-3";
  if (pax <= 6) return "transfer-4-6";
  if (pax <= 8) return "transfer-7-8";
  return "transfer-9plus";
}

/* ── Phone → country ──────────────────────────────────────────────────── */

// +1 numbers: Canadian area codes; every other +1 is treated as USA.
const CA_AREA = new Set(
  "204 226 236 249 250 257 263 273 289 306 343 354 365 367 368 382 403 416 418 428 431 437 438 450 460 468 474 506 514 519 548 579 581 584 587 600 604 613 639 647 672 683 705 709 742 753 778 780 782 807 819 825 867 873 879 902 905".split(" ")
);

// Longest prefix wins (checked 3 → 2 → 1 digits).
const CC: Record<string, [string, string]> = {
  "7": ["RU", "Russia"], "20": ["EG", "Egypt"], "27": ["ZA", "South Africa"], "30": ["GR", "Greece"],
  "31": ["NL", "Netherlands"], "32": ["BE", "Belgium"], "33": ["FR", "France"], "34": ["ES", "Spain"],
  "39": ["IT", "Italy"], "41": ["CH", "Switzerland"], "43": ["AT", "Austria"], "44": ["GB", "United Kingdom"],
  "45": ["DK", "Denmark"], "46": ["SE", "Sweden"], "47": ["NO", "Norway"], "48": ["PL", "Poland"],
  "49": ["DE", "Germany"], "51": ["PE", "Peru"], "52": ["MX", "Mexico"], "53": ["CU", "Cuba"],
  "54": ["AR", "Argentina"], "55": ["BR", "Brazil"], "56": ["CL", "Chile"], "57": ["CO", "Colombia"],
  "58": ["VE", "Venezuela"], "60": ["MY", "Malaysia"], "61": ["AU", "Australia"], "62": ["ID", "Indonesia"],
  "63": ["PH", "Philippines"], "64": ["NZ", "New Zealand"], "65": ["SG", "Singapore"], "66": ["TH", "Thailand"],
  "81": ["JP", "Japan"], "82": ["KR", "South Korea"], "86": ["CN", "China"], "90": ["TR", "Turkey"],
  "91": ["IN", "India"], "92": ["PK", "Pakistan"], "93": ["AF", "Afghanistan"], "94": ["LK", "Sri Lanka"],
  "98": ["IR", "Iran"], "211": ["SS", "South Sudan"], "212": ["MA", "Morocco"], "213": ["DZ", "Algeria"],
  "216": ["TN", "Tunisia"], "218": ["LY", "Libya"], "220": ["GM", "Gambia"], "221": ["SN", "Senegal"],
  "223": ["ML", "Mali"], "225": ["CI", "Ivory Coast"], "233": ["GH", "Ghana"], "234": ["NG", "Nigeria"],
  "249": ["SD", "Sudan"], "251": ["ET", "Ethiopia"], "252": ["SO", "Somalia"], "254": ["KE", "Kenya"],
  "255": ["TZ", "Tanzania"], "351": ["PT", "Portugal"], "352": ["LU", "Luxembourg"], "353": ["IE", "Ireland"],
  "355": ["AL", "Albania"], "358": ["FI", "Finland"], "380": ["UA", "Ukraine"], "387": ["BA", "Bosnia"],
  "502": ["GT", "Guatemala"], "503": ["SV", "El Salvador"], "506": ["CR", "Costa Rica"], "507": ["PA", "Panama"],
  "591": ["BO", "Bolivia"], "593": ["EC", "Ecuador"], "598": ["UY", "Uruguay"], "880": ["BD", "Bangladesh"],
  "960": ["MV", "Maldives"], "961": ["LB", "Lebanon"], "962": ["JO", "Jordan"], "963": ["SY", "Syria"],
  "964": ["IQ", "Iraq"], "965": ["KW", "Kuwait"], "966": ["SA", "Saudi Arabia"], "967": ["YE", "Yemen"],
  "968": ["OM", "Oman"], "970": ["PS", "Palestine"], "971": ["AE", "UAE"], "972": ["IL", "Israel"],
  "973": ["BH", "Bahrain"], "974": ["QA", "Qatar"], "994": ["AZ", "Azerbaijan"], "998": ["UZ", "Uzbekistan"],
};

/** Country from an international phone number ("+1 (514) …" → Canada). */
export function countryFromPhone(phone: string | null | undefined): { iso: string; name: string } | null {
  if (!phone) return null;
  const raw = phone.trim();
  let d = raw.replace(/\D/g, "");
  if (raw.startsWith("00")) d = d.slice(2);
  else if (!raw.startsWith("+")) return null; // no country code → can't tell
  if (d.startsWith("1")) {
    return CA_AREA.has(d.slice(1, 4)) ? { iso: "CA", name: "Canada" } : { iso: "US", name: "USA" };
  }
  for (const len of [3, 2, 1]) {
    const hit = CC[d.slice(0, len)];
    if (hit) return { iso: hit[0], name: hit[1] };
  }
  return null;
}

/* ── One line of the accounting log ───────────────────────────────────── */

export type ServiceType = "Airport pickup" | "Airport drop-off" | "Airport transfer" | "Tour" | "Package" | "Park" | "Stay" | "Activity" | "Other";
/** Payment id from whatever was pasted: "pi_…", "ch_…" or a dashboard link. */
export const parseStripeRef = (s: string | null | undefined) => (s ?? "").match(/\b(?:pi|ch|py)_[A-Za-z0-9]+/)?.[0] ?? "";

export const SERVICE_TYPES: ServiceType[] = ["Airport pickup", "Airport drop-off", "Airport transfer", "Tour", "Package", "Park", "Stay", "Activity", "Other"];

/** A partner's share of a booking's cost (packages are spread over suppliers);
    the rest of the cost is what Amanah paid directly. */
export type CostPart = { partner: string; what: string; cost: number };

/** Per-row overrides stored in orders.acct / tutcasa_transfers.acct. */
export type AcctOverrides = {
  source?: string;
  provider?: string;
  collectedBy?: string;
  charged?: number;
  method?: string;
  cost?: number;
  fee?: number;
  feeExact?: boolean; // fee read from Stripe (not an estimate)
  feeChecked?: boolean; // Stripe asked once, no match — keep the estimate
  net?: number; // what Stripe actually paid out
  received?: number; // what Stripe charged, in MXN at ITS exchange rate (client paid in USD)
  stripeRef?: string; // pi_… / ch_… for manual Stripe charges
  parts?: CostPart[]; // package split between suppliers
  commission?: number;
  country?: string;
  note?: string;
};

export type AcctRow = {
  key: string; // "o:<order id>" | "o:<order id>#stay<n>" | "t:<transfer id>" | "e:<entry id>"
  editable: boolean;
  date: string; // YYYY-MM-DD (service date)
  name: string;
  phone: string | null;
  groupKey: string;
  groupId: string; // "CA001" — same family/group across services, numbered per country & year
  country: string;
  countryIso: string;
  people: number;
  service: ServiceType;
  description: string;
  source: string;
  affiliate: string | null;
  provider: string;
  collectedBy: string; // "Amanah" or a partner name
  charged: number;
  method: string;
  cost: number;
  fee: number;
  feeExact: boolean;
  commission: number;
  note: string;
  stripeRef: string;
  parts?: CostPart[]; // when set, these partners are owed their part (not `provider` the whole cost)
};

export type RowMath = {
  gross: number; // charged − cost
  net: number; // after fees and commission
  tax: number;
  afterTax: number;
  marginBefore: number | null; // gross / charged
  marginAfterFees: number | null; // net / charged
  marginAfterTax: number | null;
};

/** Profit math for one row. Negative results are allowed (cost can exceed
    what we charged — that's a real loss, not a mistake). */
export function rowMath(r: Pick<AcctRow, "charged" | "cost" | "fee" | "commission">, taxRatePct: number): RowMath {
  const gross = r.charged - r.cost;
  const net = gross - r.fee - r.commission;
  const tax = net > 0 ? Math.round((net * taxRatePct) / 100) : 0;
  const afterTax = net - tax;
  const pct = (n: number) => (r.charged > 0 ? n / r.charged : null);
  return { gross, net, tax, afterTax, marginBefore: pct(gross), marginAfterFees: pct(net), marginAfterTax: pct(afterTax) };
}

/** Estimated processor fee (MXN) incl. 16% IVA. Stripe rate verified on a
    real foreign-card charge; PayPal / Mercado Pago are published rates. */
export function estimateFee(method: string, amount: number): number {
  const rate: Record<string, [number, number]> = {
    "Credit / Debit Card": [4.1, 3], Stripe: [4.1, 3], PayPal: [3.95, 4], "Mercado Pago": [3.49, 4],
  };
  const r = rate[method];
  if (!r || amount <= 0) return 0;
  return Math.round(((amount * r[0]) / 100 + r[1]) * 1.16);
}

/** One thing that moves a partner's balance; amount + = they owe us more.
    owesUs: a client paid THEM (our share is owed to us) · weOwe: a client paid
    US for a service they did (their cost) · theyPaid / wePaid: money sent. */
export type BalanceLine = { date: string; label: string; amount: number; type: "owesUs" | "weOwe" | "theyPaid" | "wePaid" };

/** A partner's running account: + = they owe us, − = we owe them.
    Commissions are NOT in here — they have their own tab. */
export type PartnerBalance = {
  name: string;
  partnerId: string | null;
  balance: number; // today — built from every booking and payment on record, no opening number
  lines: BalanceLine[]; // oldest first
};

/* ── The book (site_content "accounting", private) ─────────────────────── */

/** A service that isn't an order or a transfer in the system (history
    imported from the spreadsheet, or anything sold outside the site). */
export type LedgerEntry = {
  id: string;
  date: string;
  name: string;
  group: string; // optional group code (e.g. "US003") to tie a family's services together
  phone: string;
  country: string;
  people: number;
  service: ServiceType;
  description: string;
  source: string;
  provider: string;
  collectedBy: string;
  charged: number;
  method: string;
  cost: number;
  fee: number;
  commission: number;
  note: string;
};

export type Payment = {
  id: string;
  date: string;
  partner: string;
  direction: "received" | "made"; // received = they paid us; made = we paid them
  kind: "settlement" | "commission";
  method: string;
  amount: number;
  note: string;
  receipt?: string; // path in the private "receipts" storage bucket
  imported?: boolean; // from the 2026 spreadsheet → already inside the opening balance
};

export type Expense = { id: string; date: string; name: string; description: string; amount: number; receipt?: string };

export type Book = { taxRate: number; entries: LedgerEntry[]; payments: Payment[]; expenses: Expense[] };
export const EMPTY_BOOK: Book = { taxRate: 0, entries: [], payments: [], expenses: [] };

const AMANAH = "amanah";

/** Who owes whom, per partner (and per un-listed provider name). */
export function buildBalances(
  rows: AcctRow[],
  payments: Payment[],
  partners: Partner[]
): PartnerBalance[] {
  // Every booked service counts in its own month, upcoming ones too (often prepaid).
  const map = new Map<string, PartnerBalance>();
  const get = (name: string) => {
    const p = matchPartner(name, partners);
    const k = p?.id ?? norm(name);
    if (!k || k === AMANAH) return null;
    if (!map.has(k)) {
      map.set(k, { name: p?.name ?? name.trim(), partnerId: p?.id ?? null, balance: 0, lines: [] });
    }
    return map.get(k)!;
  };
  partners.forEach((p) => get(p.name));
  for (const r of rows) {
    const who = `${r.name || "—"} · ${r.service}${r.description ? ` (${r.description})` : ""}`;
    const c = r.collectedBy ? get(r.collectedBy) : null;
    if (r.parts?.length) {
      if (c && r.charged) c.lines.push({ date: r.date, label: `${who} — client paid them`, amount: r.charged, type: "owesUs" });
      for (const part of r.parts) {
        if (/^amanah/i.test(part.partner.trim())) continue; // paid by us directly — just shown on the booking
        const s = get(part.partner);
        if (s && part.cost) s.lines.push({ date: r.date, label: `${who} — their part${part.what ? `: ${part.what}` : ""}`, amount: -part.cost, type: "weOwe" });
      }
      continue;
    }
    const p = r.provider ? get(r.provider) : null;
    if (c && c === p) {
      // Client paid them for a service they did → they owe us our profit.
      if (c && (r.charged || r.cost)) {
        const profit = r.charged - r.cost;
        c.lines.push({ date: r.date, label: `${who} — client paid them ${fmt(r.charged)}, their cost ${fmt(r.cost)}`, amount: profit, type: profit >= 0 ? "owesUs" : "weOwe" });
      }
      continue;
    }
    if (c && r.charged) c.lines.push({ date: r.date, label: `${who} — client paid them`, amount: r.charged, type: "owesUs" });
    if (p && r.cost) p.lines.push({ date: r.date, label: `${who} — client paid us, their cost`, amount: -r.cost, type: "weOwe" });
  }
  for (const pay of payments) {
    if (pay.kind === "commission") continue; // → Commissions tab
    const b = get(pay.partner);
    if (!b) continue;
    const got = pay.direction === "received";
    b.lines.push({ date: pay.date, label: `${got ? "They paid us" : "We paid them"}${pay.note ? ` — ${pay.note}` : ""}`, amount: got ? -pay.amount : pay.amount, type: got ? "theyPaid" : "wePaid" });
  }
  return [...map.values()].map((b) => {
    b.lines.sort((x, y) => x.date.localeCompare(y.date));
    return { ...b, balance: b.lines.reduce((s, l) => s + l.amount, 0) };
  });
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** A partner's account for one year ("2026") or month ("2026-11"):
    what was owed before it → its lines → what's owed at the end. */
export function periodStatement(b: PartnerBalance, period: string) {
  const start = period.length === 4 ? `${period}-01-01` : `${period}-01`;
  const lines = b.lines.filter((l) => l.date.startsWith(period));
  const sum = (t: BalanceLine["type"]) => lines.filter((l) => l.type === t).reduce((s, l) => s + l.amount, 0);
  const broughtForward = b.lines.filter((l) => l.date < start).reduce((s, l) => s + l.amount, 0);
  return {
    broughtForward,
    owesUs: sum("owesUs"),
    weOwe: -sum("weOwe"),
    theyPaid: -sum("theyPaid"),
    wePaid: sum("wePaid"),
    carried: broughtForward + lines.reduce((s, l) => s + l.amount, 0),
    lines,
  };
}

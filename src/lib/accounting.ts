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

export const PAYMENT_METHODS = ["Cash", "Card", "Stripe", "Bank transfer", "PayPal", "Other"];

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
export const SERVICE_TYPES: ServiceType[] = ["Airport pickup", "Airport drop-off", "Airport transfer", "Tour", "Package", "Park", "Stay", "Activity", "Other"];

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
  net?: number; // what Stripe actually paid out
  stripeRef?: string; // pi_… / ch_… for manual Stripe charges
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

/** Balance one partner: + = they owe us, − = we owe them. */
export type PartnerBalance = {
  name: string;
  partnerId: string | null;
  opening: number;
  collected: number; // client money THEY received for our services → owed to us
  ourCost: number; // their earnings for services they performed → we owe them
  commission: number; // commission they earned → we owe them
  received: number; // payments they made to us
  paid: number; // payments we made to them
  balance: number;
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
};

export type Expense = { id: string; date: string; name: string; description: string; amount: number; receipt?: string };

export type Book = { taxRate: number; entries: LedgerEntry[]; payments: Payment[]; expenses: Expense[] };
export const EMPTY_BOOK: Book = { taxRate: 0, entries: [], payments: [], expenses: [] };

const AMANAH = "amanah";

/** Who owes whom, per partner (and per un-listed provider name). */
export function buildBalances(
  rows: AcctRow[],
  payments: Payment[],
  partners: Partner[],
  asOf = new Date().toISOString().slice(0, 10) // services still in the future aren't owed yet
): PartnerBalance[] {
  const map = new Map<string, PartnerBalance & { from: string }>();
  const get = (name: string) => {
    const p = matchPartner(name, partners);
    const k = p?.id ?? norm(name);
    if (!k || k === AMANAH) return null;
    if (!map.has(k)) {
      map.set(k, {
        name: p?.name ?? name.trim(), partnerId: p?.id ?? null, from: p?.openingDate ?? "",
        opening: p?.openingBalance ?? 0, collected: 0, ourCost: 0, commission: 0, received: 0, paid: 0, balance: 0,
      });
    }
    return map.get(k)!;
  };
  partners.forEach((p) => get(p.name));
  // Anything dated before a partner's opening date is already in its opening balance.
  const live = (b: { from: string }, date: string) => !b.from || date >= b.from;
  for (const r of rows) {
    if (r.date > asOf) continue;
    const c = r.collectedBy ? get(r.collectedBy) : null;
    if (c && live(c, r.date)) c.collected += r.charged;
    const p = r.provider ? get(r.provider) : null;
    if (p && live(p, r.date)) p.ourCost += r.cost;
    const a = r.affiliate && r.commission ? get(r.affiliate) : null;
    if (a && live(a, r.date)) a.commission += r.commission;
  }
  for (const pay of payments) {
    const b = get(pay.partner);
    if (!b || !live(b, pay.date)) continue;
    if (pay.direction === "received") b.received += pay.amount;
    else b.paid += pay.amount;
  }
  return [...map.values()].map(({ from: _from, ...b }) => ({
    ...b,
    balance: b.opening + b.collected - b.ourCost - b.commission - b.received + b.paid,
  }));
}

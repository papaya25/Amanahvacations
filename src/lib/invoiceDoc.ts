/* Quotes & invoices (booking confirmations) — Maher's approved AV-folio
   layout. One flexible shape for both: every section is a label/value list
   so customized tours can say anything. Empty sections are simply hidden. */

export type DocKind = "quote" | "invoice";
export type Pair = { label: string; value: string };
export type Day = { date: string; title: string; desc: string; durLabel: string; dur: string };

export type DocData = {
  client: string; // names — list, greeting, PDF file name
  issued: string; // YYYY-MM-DD
  greeting: string;
  eyebrow: string;
  service: string;
  sub: string;
  route: Pair[]; // dots on the green ticket: label (Pick-up / Stop 1 / Return) + place
  facts: Pair[]; // bottom of the green ticket (max ~4)
  stubLabel: string;
  stubText: string; // gold stub; empty on an invoice = the folio
  guests: Pair[];
  pickupTitle: string;
  pickup: Pair[];
  totalMXN: number; // 0 = FREE
  totalUSD: number; // 0 = hidden
  payment: Pair[];
  status: string; // Pending | Confirmed | Paid | "" (hidden)
  reservation: Pair[];
  schedule: Day[];
  notes: string[];
};

export type DocRow = { id: string; kind: DocKind; folio: number | null; order_id: string | null; data: DocData; updated_at: string };

export const STATUSES = ["Pending", "Confirmed", "Paid", ""] as const;
export const STANDARD_NOTES = [
  "Round trip service payment must be paid at the first ride.",
  "Payments by card or PayPal have an extra charge of 5% on the cost of your service.",
];
export const RESERVATION_DEFAULT: Pair[] = [
  { label: "Reservation manager", value: "Maher" },
  { label: "WhatsApp", value: "+52 990 351 6948" },
  { label: "Observations", value: "—" },
];
export const FIRST_FOLIO = 454; // AV 451–453 were made by hand before this system

export const folioLabel = (n: number | null) => (n ? `AV ${n}` : "");
export const todayMx = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Cancun" });

const asDate = (d: string) => new Date(`${d}T12:00:00`);
const valid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(+asDate(d));
/** "Thu, Nov 19, 2026" */
export const shortDate = (d: string) =>
  valid(d) ? asDate(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : d;
/** "November 18, 2026" */
export const longDate = (d: string) => (valid(d) ? asDate(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : d);
export const dayParts = (d: string) =>
  valid(d)
    ? {
        wd: asDate(d).toLocaleDateString("en-US", { weekday: "short" }),
        day: String(asDate(d).getDate()),
        mon: asDate(d).toLocaleDateString("en-US", { month: "short" }),
      }
    : { wd: "", day: d, mon: "" };

export function blankDoc(kind: DocKind): DocData {
  const quote = kind === "quote";
  return {
    client: "",
    issued: todayMx(),
    greeting: quote ? "Dear …, your trip in the Riviera Maya, planned day by day." : "Dear …, your experience is reserved.",
    eyebrow: quote ? "Your trip" : "Your experience",
    service: "",
    sub: "Private transportation included",
    route: quote ? [] : [{ label: "Pick-up", value: "" }, { label: "Stop 1", value: "" }, { label: "Return", value: "" }],
    facts: quote
      ? [{ label: "Dates", value: "" }, { label: "Guests", value: "" }]
      : [{ label: "Date", value: "" }, { label: "Pick-up", value: "" }, { label: "Guests", value: "" }],
    stubLabel: quote ? "Quote" : "Folio",
    stubText: "",
    guests: [{ label: "Name", value: "" }, { label: "Phone", value: "" }, { label: "Passengers", value: "" }],
    pickupTitle: "Pick-up",
    pickup: quote ? [] : [{ label: "Pick-up place", value: "" }, { label: "Pick-up time", value: "" }, { label: "Return to", value: "" }],
    totalMXN: 0,
    totalUSD: 0,
    payment: [],
    status: quote ? "" : "Pending",
    reservation: RESERVATION_DEFAULT,
    schedule: [],
    notes: STANDARD_NOTES,
  };
}

/** Browser "Save as PDF" uses the page title as the file name: "WAEL - AV 454". */
export const docFileName = (kind: DocKind, folio: number | null, d: DocData) =>
  `${(d.client || "Client").toUpperCase()} - ${kind === "invoice" ? folioLabel(folio) : "Quote"}`;

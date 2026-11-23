"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { getPublicContent } from "@/lib/content/site";
import type { CartItem } from "@/lib/cart";
import {
  FIRST_FOLIO, RESERVATION_DEFAULT, STANDARD_NOTES, blankDoc, shortDate, todayMx,
  type DocData, type DocKind, type DocRow, type Pair,
} from "@/lib/invoiceDoc";

type Res = { ok: boolean; error?: string; id?: string };
const NOT_IN = { ok: false, error: "Not signed in." };

export async function listDocuments(): Promise<DocRow[]> {
  if (!(await isAdminRequest())) return [];
  const { data } = await createAdminClient()
    .from("documents")
    .select("id, kind, folio, order_id, data, updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  return (data ?? []) as DocRow[];
}

export async function getDocument(id: string): Promise<DocRow | null> {
  if (!(await isAdminRequest())) return null;
  const { data } = await createAdminClient().from("documents").select("id, kind, folio, order_id, data, updated_at").eq("id", id).maybeSingle();
  return (data as DocRow) ?? null;
}

/** Insert; invoices take the next AV folio (retry if two are made at once). */
async function insertDoc(kind: DocKind, data: DocData, orderId: string | null = null): Promise<Res> {
  const supabase = createAdminClient();
  for (let attempt = 0; attempt < 3; attempt++) {
    let folio: number | null = null;
    if (kind === "invoice") {
      const { data: top } = await supabase.from("documents").select("folio").not("folio", "is", null).order("folio", { ascending: false }).limit(1);
      folio = Math.max(FIRST_FOLIO - 1, top?.[0]?.folio ?? 0) + 1;
    }
    const { data: row, error } = await supabase.from("documents").insert({ kind, folio, order_id: orderId, data }).select("id").single();
    if (!error) {
      revalidatePath("/admin/invoices");
      return { ok: true, id: row.id };
    }
    if (error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: false, error: "Couldn't get a folio number. Please try again." };
}

export async function createDocument(kind: DocKind): Promise<Res> {
  if (!(await isAdminRequest())) return NOT_IN;
  return insertDoc(kind, blankDoc(kind));
}

/** One click from a booking: everything the order already knows is filled in. */
export async function createFromOrder(orderId: string): Promise<Res> {
  if (!(await isAdminRequest())) return NOT_IN;
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("documents").select("id").eq("order_id", orderId).eq("kind", "invoice").limit(1);
  if (existing?.[0]) return { ok: true, id: existing[0].id };
  const { data: o } = await supabase
    .from("orders")
    .select("id, status, items, total, payment_method, customer_name, customer_whatsapp, notes")
    .eq("id", orderId)
    .maybeSingle();
  if (!o) return { ok: false, error: "Booking not found." };
  const cur = await getPublicContent("currency", { defaultCurrency: "USD", rateUSD: 17.5, rateEUR: 19.5 });
  return insertDoc("invoice", docFromOrder(o as OrderLite, cur.rateUSD > 0 ? cur.rateUSD : 17.5), orderId);
}

type OrderLite = {
  status: string; items: CartItem[]; total: number; payment_method: string;
  customer_name: string; customer_whatsapp: string | null; notes: string | null;
};

function docFromOrder(o: OrderLite, rateUSD: number): DocData {
  const items = o.items ?? [];
  const isFee = (i: CartItem) => i.title.startsWith("Card payment fee");
  const main = items.find((i) => !isFee(i) && i.kind !== "stay") ?? items[0];
  const m = (main?.meta ?? {}) as Record<string, string>;
  const date = m.date || m.checkin || "";
  const people = Math.max(1, ...items.map((i) => i.people || 1));
  const pkg = Boolean(m.pkgId && m.pkgId !== "tour");
  const kindLabel = pkg ? "Package" : m.activity_id ? "Park" : "Tour";
  const title = main?.title ?? "";
  const tbc = "To be confirmed";
  const paid = o.status.startsWith("Paid") || o.status === "Completed";
  const lines = items.filter((i) => i !== main);
  const payment: Pair[] = [
    ...(lines.length ? [{ label: title, value: `${(Number(main?.total) || 0).toLocaleString("en-US")} MXN` }] : []),
    ...lines.map((i) => ({ label: isFee(i) ? "Card fee (5%)" : i.title, value: `${(Number(i.total) || 0).toLocaleString("en-US")} MXN` })),
    ...(o.payment_method && o.payment_method !== "Manual (offline)" ? [{ label: "Method", value: o.payment_method }] : []),
  ];
  return {
    ...blankDoc("invoice"),
    client: o.customer_name,
    issued: todayMx(),
    greeting: `Dear ${o.customer_name}, your ${title} ${pkg ? "trip" : "day"} is reserved.`,
    service: title,
    sub: m.custom ? `Customized: ${m.custom}` : main?.subtitle && main.subtitle !== "Added manually" ? main.subtitle : "Private transportation included",
    route: pkg ? [] : [{ label: "Pick-up", value: tbc }, { label: kindLabel, value: title }, { label: "Return", value: tbc }],
    facts: pkg
      ? [{ label: "Check-in", value: shortDate(date) }, { label: "Guests", value: String(people) }]
      : [{ label: "Date", value: shortDate(date) }, { label: "Pick-up", value: "TBC" }, { label: "Guests", value: String(people) }],
    guests: [
      { label: "Name", value: o.customer_name },
      ...(o.customer_whatsapp ? [{ label: "Phone", value: o.customer_whatsapp }] : []),
      { label: "Passengers", value: String(people) },
    ],
    pickup: [
      { label: "Pick-up place", value: tbc },
      { label: "Pick-up time", value: tbc },
      { label: "Return to", value: tbc },
      { label: "Transportation", value: "Round trip included" },
    ],
    totalMXN: Math.round(o.total),
    totalUSD: Math.round(o.total / rateUSD),
    payment,
    status: paid ? "Paid" : "Pending",
    reservation: RESERVATION_DEFAULT.map((r) => (r.label === "Observations" && o.notes ? { ...r, value: o.notes } : r)),
    notes: STANDARD_NOTES,
  };
}

export async function saveDocument(id: string, data: DocData): Promise<Res> {
  if (!(await isAdminRequest())) return NOT_IN;
  const { error } = await createAdminClient().from("documents").update({ data, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/invoices");
  return error ? { ok: false, error: error.message } : { ok: true, id };
}

/** The client said yes: the quote becomes a booking confirmation with the next folio. */
export async function quoteToInvoice(id: string): Promise<Res> {
  if (!(await isAdminRequest())) return NOT_IN;
  const doc = await getDocument(id);
  if (!doc) return { ok: false, error: "Not found." };
  const data: DocData = {
    ...doc.data,
    issued: todayMx(),
    greeting: doc.data.greeting.replace(/,? planned day by day\.?$/, ", is reserved."),
    stubLabel: "Folio",
    stubText: "",
    status: doc.data.status || "Pending",
  };
  return insertDoc("invoice", data, doc.order_id);
}

export async function deleteDocument(id: string): Promise<Res> {
  if (!(await isAdminRequest())) return NOT_IN;
  const { error } = await createAdminClient().from("documents").delete().eq("id", id);
  revalidatePath("/admin/invoices");
  return error ? { ok: false, error: error.message } : { ok: true };
}

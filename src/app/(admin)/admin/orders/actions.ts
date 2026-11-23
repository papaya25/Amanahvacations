"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { ORDER_STATUSES, type AdminOrder } from "./types";
import { getPartners } from "@/lib/content/partners";
import { matchPartner } from "@/lib/accounting";

export async function listOrders(): Promise<AdminOrder[] | null> {
  if (!(await isAdminRequest())) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("listOrders:", error.message);
    return null;
  }
  return data as AdminOrder[];
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not logged in." };
  if (!(ORDER_STATUSES as readonly string[]).includes(status))
    return { ok: false, error: "Unknown status." };
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true };
}

/* ── Manual orders (phone/WhatsApp sales of a package, tour or park) ──────
   Inserted as normal orders with source='manual' so they flow into the
   dashboard splits, calendar, Profits and Accounting (meta carries
   pkgId/tour_key/activity_id for cost matching). No emails are sent — the
   sale already happened offline. The same builder powers "Edit". */

const CARD_FEE_PCT = 5;

export type OrderInput = {
  kind: "package" | "tour" | "park";
  catalogId: string; // package id, tour key or park id
  title: string; // display name from the picker (server stores what admin saw)
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  people: number;
  date: string; // YYYY-MM-DD (tour date / package check-in)
  totalMXN: number; // the agreed price, before any card fee
  paymentMethod?: string;
  cardSurcharge?: boolean; // Card / Stripe: add 5% on top for the client
  stripeFee?: number; // what Stripe kept (Accounting)
  source?: string; // where the client came from — an affiliate name earns commission
  extraActivity?: string; // another activity added to the tour
  extraActivityPrice?: number; // MXN, part of the total charged
  customization?: string; // customized activity / changes under this tour
  costMXN?: number; // what the whole booking costs US — drives Profits
  performedBy?: string; // guide / provider who ran it
  notes?: string;
};

type Built = { items: Record<string, unknown>[]; total: number; referrer: string | null; acct: Record<string, unknown> };

async function buildManualOrder(input: OrderInput, keepMeta: Record<string, string> = {}): Promise<{ error: string } | Built> {
  if (!input.customerName?.trim() || !input.date || !input.title?.trim()) {
    return { error: "Customer name, item and date are required." };
  }
  if (!(input.totalMXN > 0)) return { error: "Enter the total price (MXN)." };
  const people = Math.max(1, input.people || 1);
  const extraName = input.extraActivity?.trim() || "";
  const extraPrice = extraName ? Math.max(0, Math.round(input.extraActivityPrice || 0)) : 0;
  const total = Math.round(input.totalMXN);
  if (extraPrice > total) return { error: "The extra activity price can't exceed the total." };
  const custom = input.customization?.trim() || "";
  const performer = input.performedBy?.trim() || "";
  const cost = input.costMXN && input.costMXN > 0 ? Math.round(input.costMXN) : null;

  const details = [input.date, `${people} ${people === 1 ? "person" : "people"}`];
  if (custom) details.push(`Customized: ${custom}`);
  if (performer) details.push(`Performed by: ${performer}`);
  if (cost !== null) details.push(`Our cost: $${cost.toLocaleString("en-US")} MXN`);

  // The whole booking's cost sits on the main line (meta.manual_cost), so
  // Profits uses it instead of the catalogue cost table; the extra line
  // carries 0 so it isn't flagged as "cost missing".
  const baseMeta = {
    ...keepMeta,
    currency: "MXN",
    ...(input.kind === "tour"
      ? { tour_key: input.catalogId, date: input.date }
      : input.kind === "park"
        ? { activity_id: input.catalogId, date: input.date }
        : { pkgId: input.catalogId, checkin: input.date }),
    ...(custom ? { custom } : {}),
    ...(performer ? { performed_by: performer } : {}),
    ...(cost !== null ? { manual_cost: String(cost) } : {}),
  };
  const items: Record<string, unknown>[] = [
    {
      id: "m1",
      kind: input.kind === "park" ? "activity" : input.kind,
      title: input.title.trim(),
      subtitle: "Added manually",
      details,
      total: total - extraPrice,
      people,
      meta: baseMeta,
    },
  ];
  if (extraName) {
    items.push({
      id: "m2",
      kind: "activity",
      title: extraName,
      subtitle: `Extra with ${input.title.trim()}`,
      details: [input.date, `${people} ${people === 1 ? "person" : "people"}`],
      total: extraPrice,
      people,
      meta: { date: input.date, currency: "MXN", ...(cost !== null ? { manual_cost: "0" } : {}) },
    });
  }

  /* Card fee: 5% on top, paid by the client.
     - "Card" = the provider's own terminal → the 5% goes to the provider's
       card processor, not to us (its cost equals the fee, so it nets to zero).
     - "Stripe" = our account → the 5% is ours; Stripe's own fee is a cost. */
  const isCard = input.paymentMethod === "Card" || input.paymentMethod === "Stripe";
  const cardFee = isCard && input.cardSurcharge !== false ? Math.round((total * CARD_FEE_PCT) / 100) : 0;
  if (cardFee > 0) {
    const viaProvider = input.paymentMethod === "Card";
    items.push({
      id: "m3",
      kind: "activity",
      title: `Card payment fee (${CARD_FEE_PCT}%)`,
      subtitle: viaProvider ? "Charged to the client — goes to the provider's card processor" : "Charged to the client",
      details: [`${CARD_FEE_PCT}% of $${total.toLocaleString("en-US")} MXN`],
      total: cardFee,
      people,
      meta: { date: input.date, currency: "MXN", manual_cost: viaProvider ? String(cardFee) : "0" },
    });
  }

  // Came from: an affiliate partner → stamped as referrer (commission).
  const source = input.source?.trim() || "WhatsApp / direct";
  const affiliate = matchPartner(source, await getPartners());
  const acct: Record<string, unknown> = { source };
  if (input.paymentMethod === "Stripe" && (input.stripeFee ?? 0) > 0) acct.fee = Math.round(input.stripeFee!);
  return { items, total: total + cardFee, referrer: affiliate?.affiliate ? affiliate.id : null, acct };
}

export async function createManualOrder(input: OrderInput): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  const built = await buildManualOrder(input);
  if ("error" in built) return { ok: false, error: built.error };
  const supabase = createAdminClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `AMN-${Math.floor(100000 + Math.random() * 900000)}`;
    const { error } = await supabase.from("orders").insert({
      id,
      status: "Confirmed",
      source: "manual",
      items: built.items,
      subtotal: built.total,
      discount: 0,
      total: built.total,
      payment_method: input.paymentMethod?.trim() || "Manual (offline)",
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail?.trim() || "",
      customer_whatsapp: input.customerPhone?.trim() || null,
      notes: input.notes?.trim() || null,
      consent: true,
      consent_at: new Date().toISOString(),
      referrer: built.referrer,
      acct: built.acct,
    });
    if (!error) {
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
      return { ok: true };
    }
    if (error.code !== "23505") {
      console.error("createManualOrder:", error.message);
      return { ok: false, error: "Couldn't save the order. Please try again." };
    }
  }
  return { ok: false, error: "Couldn't save the order. Please try again." };
}

/** Edit any order, whatever its status. Manual and TutCasa orders are rebuilt
    from the form; website orders keep their paid items and price — only the
    customer details and accounting info change. */
export async function updateOrder(id: string, input: OrderInput): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  if (!input.customerName?.trim()) return { ok: false, error: "Customer name is required." };
  const supabase = createAdminClient();
  const { data: order } = await supabase.from("orders").select("source, items, acct").eq("id", id).maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };
  const prevAcct = (order.acct as Record<string, unknown>) ?? {};
  const customer = {
    customer_name: input.customerName.trim(),
    customer_email: input.customerEmail?.trim() ?? "",
    customer_whatsapp: input.customerPhone?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  let patch: Record<string, unknown>;
  if (order.source === "manual" || order.source === "tutcasa") {
    // Keep link fields (e.g. the TutCasa booking id) from the old main line.
    const oldMeta = ((order.items as { meta?: Record<string, string> }[])?.[0]?.meta ?? {}) as Record<string, string>;
    const keep: Record<string, string> = oldMeta.tutcasa_booking_id ? { tutcasa_booking_id: oldMeta.tutcasa_booking_id } : {};
    const built = await buildManualOrder(input, keep);
    if ("error" in built) return { ok: false, error: built.error };
    // The form now owns price, cost, provider and fee: drop older overrides.
    const { fee: _fee, feeExact: _fx, cost: _c, provider: _p, charged: _ch, ...rest } = prevAcct;
    patch = {
      ...customer,
      items: built.items,
      subtotal: built.total,
      discount: 0,
      total: built.total,
      payment_method: input.paymentMethod?.trim() || "Manual (offline)",
      referrer: built.referrer,
      acct: { ...rest, ...built.acct },
    };
  } else {
    const source = input.source?.trim() || "Website";
    const affiliate = matchPartner(source, await getPartners());
    const { cost: _c, provider: _p, ...rest } = prevAcct;
    const acct: Record<string, unknown> = {
      ...rest,
      source,
      ...(input.costMXN && input.costMXN > 0 ? { cost: Math.round(input.costMXN) } : {}),
      ...(input.performedBy?.trim() ? { provider: input.performedBy.trim() } : {}),
    };
    patch = { ...customer, referrer: affiliate?.affiliate ? affiliate.id : null, acct };
  }
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) {
    console.error("updateOrder:", error.message);
    return { ok: false, error: "Couldn't save. Please try again." };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/accounting");
  return { ok: true };
}

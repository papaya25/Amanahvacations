"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { ORDER_STATUSES, type AdminOrder } from "./types";

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

/* ── Manual orders (phone/WhatsApp sales of a package or tour) ────────────
   Inserted as normal orders with source='manual' so they flow into the
   dashboard splits, calendar, and Profits (meta carries pkgId/tour_key for
   cost matching). No emails are sent — the sale already happened offline. */

export async function createManualOrder(input: {
  kind: "package" | "tour";
  catalogId: string; // package id or tour key
  title: string; // display name from the picker (server stores what admin saw)
  customerName: string;
  customerPhone?: string;
  people: number;
  date: string; // YYYY-MM-DD (tour date / package check-in)
  totalMXN: number;
  paymentMethod?: string;
  extraActivity?: string; // another activity added to the tour
  extraActivityPrice?: number; // MXN, part of the total charged
  customization?: string; // customized activity / changes under this tour
  costMXN?: number; // what the whole booking costs US — drives Profits
  performedBy?: string; // guide / provider who ran it
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  if (!input.customerName?.trim() || !input.date || !input.title?.trim()) {
    return { ok: false, error: "Customer name, item and date are required." };
  }
  if (!(input.totalMXN > 0)) return { ok: false, error: "Enter the total price (MXN)." };
  const people = Math.max(1, input.people || 1);
  const supabase = createAdminClient();

  const extraName = input.extraActivity?.trim() || "";
  const extraPrice = extraName ? Math.max(0, Math.round(input.extraActivityPrice || 0)) : 0;
  const total = Math.round(input.totalMXN);
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
    currency: "MXN",
    ...(input.kind === "tour"
      ? { tour_key: input.catalogId, date: input.date }
      : { pkgId: input.catalogId, checkin: input.date }),
    ...(custom ? { custom } : {}),
    ...(performer ? { performed_by: performer } : {}),
    ...(cost !== null ? { manual_cost: String(cost) } : {}),
  };
  const items = [
    {
      id: "m1",
      kind: input.kind,
      title: input.title.trim(),
      subtitle: "Added manually",
      details,
      total: total - extraPrice,
      people,
      meta: baseMeta,
    },
    ...(extraName
      ? [
          {
            id: "m2",
            kind: "activity" as const,
            title: extraName,
            subtitle: `Extra with ${input.title.trim()}`,
            details: [input.date, `${people} ${people === 1 ? "person" : "people"}`],
            total: extraPrice,
            people,
            meta: { date: input.date, currency: "MXN", ...(cost !== null ? { manual_cost: "0" } : {}) },
          },
        ]
      : []),
  ];
  if (extraPrice > total) return { ok: false, error: "The extra activity price can't exceed the total." };

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `AMN-${Math.floor(100000 + Math.random() * 900000)}`;
    const { error } = await supabase.from("orders").insert({
      id,
      status: "Confirmed",
      source: "manual",
      items,
      subtotal: total,
      discount: 0,
      total,
      payment_method: input.paymentMethod?.trim() || "Manual (offline)",
      customer_name: input.customerName.trim(),
      customer_email: "",
      customer_whatsapp: input.customerPhone?.trim() || null,
      consent: true,
      consent_at: new Date().toISOString(),
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

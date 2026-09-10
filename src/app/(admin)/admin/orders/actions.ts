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
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not signed in." };
  if (!input.customerName?.trim() || !input.date || !input.title?.trim()) {
    return { ok: false, error: "Customer name, item and date are required." };
  }
  if (!(input.totalMXN > 0)) return { ok: false, error: "Enter the total price (MXN)." };
  const people = Math.max(1, input.people || 1);
  const supabase = createAdminClient();

  const item = {
    id: "m1",
    kind: input.kind,
    title: input.title.trim(),
    subtitle: "Added manually",
    details: [input.date, `${people} ${people === 1 ? "person" : "people"}`],
    total: Math.round(input.totalMXN),
    people,
    meta:
      input.kind === "tour"
        ? { tour_key: input.catalogId, date: input.date, currency: "MXN" }
        : { pkgId: input.catalogId, checkin: input.date, currency: "MXN" },
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `AMN-${Math.floor(100000 + Math.random() * 900000)}`;
    const { error } = await supabase.from("orders").insert({
      id,
      status: "Confirmed",
      source: "manual",
      items: [item],
      subtotal: item.total,
      discount: 0,
      total: item.total,
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

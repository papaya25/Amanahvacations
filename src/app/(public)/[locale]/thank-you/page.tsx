import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouClient from "./ThankYouClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { capturePayPalOrder, paypalConfigured } from "@/lib/paypal";
import { mercadoPagoConfigured, verifyMercadoPagoPayment } from "@/lib/mercadopago";
import { notifyOrderPaid } from "@/lib/orderEmails";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your Amanah Vacations booking has been received.",
  robots: { index: false },
};

// Order-specific and noindex — render on demand (never statically prebuilt).
export const dynamic = "force-dynamic";

async function markPaid(orderId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .update({ status: "Paid (test mode)" })
    .eq("id", orderId)
    .in("status", ["Pending payment", "Pending confirmation"])
    .select("id");
  // Notify only on the actual transition (not when the page is refreshed).
  if (data?.length) await notifyOrderPaid(orderId).catch(() => {});
}

/* Each provider sends the customer back with its own reference; we always
   verify with the provider's API directly (never trusting the URL alone)
   before marking the order paid. */
async function verifyStripe(orderId: string, sessionId: string): Promise<boolean> {
  if (!stripeConfigured) return false;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return false;
    if (session.metadata?.order_id !== orderId) return false;
    await markPaid(orderId);
    return true;
  } catch (e) {
    console.error("verifyStripe:", e instanceof Error ? e.message : e);
    return false;
  }
}

async function verifyPayPal(orderId: string, paypalOrderId: string): Promise<boolean> {
  if (!paypalConfigured) return false;
  try {
    const capturedFor = await capturePayPalOrder(paypalOrderId);
    if (capturedFor !== orderId) return false;
    await markPaid(orderId);
    return true;
  } catch (e) {
    console.error("verifyPayPal:", e instanceof Error ? e.message : e);
    return false;
  }
}

async function verifyMercadoPago(orderId: string, paymentId: string): Promise<boolean> {
  if (!mercadoPagoConfigured) return false;
  try {
    const paidFor = await verifyMercadoPagoPayment(paymentId);
    if (paidFor !== orderId) return false;
    await markPaid(orderId);
    return true;
  } catch (e) {
    console.error("verifyMercadoPago:", e instanceof Error ? e.message : e);
    return false;
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    session_id?: string; // Stripe
    pp?: string; // PayPal marker
    token?: string; // PayPal order id
    mp?: string; // Mercado Pago marker
    payment_id?: string; // Mercado Pago payment id
  }>;
}) {
  const { id, session_id, pp, token, mp, payment_id } = await searchParams;
  let paid = false;
  if (id && session_id) paid = await verifyStripe(id, session_id);
  else if (id && pp === "1" && token) paid = await verifyPayPal(id, token);
  else if (id && mp === "1" && payment_id) paid = await verifyMercadoPago(id, payment_id);
  return (
    <Suspense>
      <ThankYouClient paid={paid} />
    </Suspense>
  );
}

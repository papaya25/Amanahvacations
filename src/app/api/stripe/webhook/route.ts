import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { notifyOrderPaid } from "@/lib/orderEmails";

/* Stripe webhook: marks an order paid even if the customer never returns to
   the thank-you page (closed tab, lost connection). Safe to run alongside the
   thank-you verification — the status-transition guard makes whichever runs
   first win, and the other becomes a no-op.

   Activation (at launch): create the endpoint in Stripe pointing at
   https://<site>/api/stripe/webhook with the checkout.session.completed event,
   then set STRIPE_WEBHOOK_SECRET to the endpoint's signing secret. */

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripeConfigured) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event;
  try {
    const payload = await request.text();
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch (e) {
    console.error("stripe webhook signature:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("orders")
        .update({ status: "Paid (test mode)" })
        .eq("id", orderId)
        .in("status", ["Pending payment", "Pending confirmation"])
        .select("id");
      if (data?.length) await notifyOrderPaid(orderId).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}

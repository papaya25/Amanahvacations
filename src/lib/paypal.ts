import "server-only";

/* PayPal Orders API v2 (sandbox until launch — the env keys decide).
   Flow: create an order with the SERVER-computed amount → customer approves on
   PayPal's page → we capture on return and only then mark the booking paid. */

const BASE = "https://api-m.sandbox.paypal.com";

export const paypalConfigured = Boolean(
  process.env.PAYPAL_SANDBOX_CLIENT_ID && process.env.PAYPAL_SANDBOX_SECRET
);

async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_SANDBOX_CLIENT_ID;
  const secret = process.env.PAYPAL_SANDBOX_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials not set");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** Create a PayPal order for `totalMXN`; returns the customer approval URL. */
export async function createPayPalOrder(
  orderId: string,
  totalMXN: number,
  origin: string
): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: orderId,
          description: `Amanah Vacations — Booking ${orderId}`,
          amount: { currency_code: "MXN", value: totalMXN.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "Amanah Vacations",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${origin}/thank-you?id=${orderId}&pp=1`,
        cancel_url: `${origin}/checkout?cancelled=1`,
      },
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as {
    id?: string;
    links?: { rel: string; href: string }[];
    message?: string;
  };
  if (!res.ok) throw new Error(`PayPal create order failed: ${data.message ?? res.status}`);
  const approve = data.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal order has no approval link");
  return approve;
}

/** Capture an approved PayPal order. Returns the booking id it belongs to
    (from custom_id) when the capture completed, else null. */
export async function capturePayPalOrder(paypalOrderId: string): Promise<string | null> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = (await res.json()) as {
    status?: string;
    purchase_units?: { payments?: { captures?: { status: string; custom_id?: string }[] } }[];
  };
  if (!res.ok || data.status !== "COMPLETED") return null;
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture || capture.status !== "COMPLETED") return null;
  return capture.custom_id ?? null;
}

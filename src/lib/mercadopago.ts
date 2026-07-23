import "server-only";

/* Mercado Pago Checkout Pro (test credentials until launch — the env token
   decides; the current token belongs to an MP test user, verified via
   /users/me tags). Flow: create a payment preference with the SERVER-computed
   amount → customer pays on Mercado Pago's page → we verify the payment by id
   on return and only then mark the booking paid. */

const BASE = "https://api.mercadopago.com";

export const mercadoPagoConfigured = Boolean(process.env.MERCADOPAGO_TEST_ACCESS_TOKEN);

function tokenOrThrow(): string {
  const token = process.env.MERCADOPAGO_TEST_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago access token not set");
  return token;
}

/** Create a Checkout Pro preference for `totalMXN`; returns the pay URL. */
export async function createMercadoPagoPreference(
  orderId: string,
  totalMXN: number,
  origin: string,
  customerEmail: string
): Promise<string> {
  const res = await fetch(`${BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenOrThrow()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: `Amanah Vacations — Booking ${orderId}`,
          quantity: 1,
          currency_id: "MXN",
          unit_price: totalMXN,
        },
      ],
      external_reference: orderId,
      payer: { email: customerEmail },
      back_urls: {
        success: `${origin}/thank-you?id=${orderId}&mp=1`,
        pending: `${origin}/thank-you?id=${orderId}&mp=1`,
        failure: `${origin}/checkout?cancelled=1`,
      },
      // MP only allows auto-redirect back to https URLs; on localhost the
      // customer clicks the return link instead (same params either way).
      ...(origin.startsWith("https") ? { auto_return: "approved" } : {}),
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as { init_point?: string; message?: string };
  if (!res.ok || !data.init_point)
    throw new Error(`Mercado Pago preference failed: ${data.message ?? res.status}`);
  return data.init_point;
}

/** Verify a payment by id. Returns the booking id (external_reference) when
    the payment is approved, else null. */
export async function verifyMercadoPagoPayment(paymentId: string): Promise<string | null> {
  const res = await fetch(`${BASE}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${tokenOrThrow()}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: string; external_reference?: string };
  if (data.status !== "approved") return null;
  return data.external_reference ?? null;
}

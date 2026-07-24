import "server-only";

/* Master switch for real-money payments.

   Set PAYMENTS_LIVE=true (in Vercel's environment, at launch) to charge real
   money across Stripe, PayPal, and Mercado Pago. Anywhere it is unset or not
   exactly "true" — local development, preview builds — every provider stays in
   test/sandbox mode, so development can never accidentally touch live
   credentials or move real money.

   Each provider reads a SEPARATE set of live-named variables when live (e.g.
   STRIPE_SECRET_KEY_LIVE, PAYPAL_LIVE_*, MERCADOPAGO_LIVE_ACCESS_TOKEN) and the
   existing test/sandbox variables otherwise — so the test keys stay put for
   local work and the live keys live only in Vercel. */
export const PAYMENTS_LIVE = process.env.PAYMENTS_LIVE === "true";

/* Status stamped on an order once its payment is verified. In live mode it's a
   plain "Paid"; in test/sandbox mode it's marked so test orders are obvious in
   the admin. Both are recognised everywhere order status is displayed. */
export const PAID_STATUS = PAYMENTS_LIVE ? "Paid" : "Paid (test mode)";

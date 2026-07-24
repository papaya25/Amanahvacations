import "server-only";
import Stripe from "stripe";
import { PAYMENTS_LIVE } from "@/lib/payments";

/* Server-only Stripe client. In live mode it uses STRIPE_SECRET_KEY_LIVE
   (sk_live_*, set in Vercel at launch); otherwise STRIPE_SECRET_KEY (sk_test_*,
   used locally) — which can never move real money. */

const stripeKey = () =>
  PAYMENTS_LIVE ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY;

export const stripeConfigured = Boolean(stripeKey());

export function getStripe(): Stripe {
  const key = stripeKey();
  if (!key)
    throw new Error(
      PAYMENTS_LIVE ? "STRIPE_SECRET_KEY_LIVE is not set" : "STRIPE_SECRET_KEY is not set"
    );
  return new Stripe(key);
}

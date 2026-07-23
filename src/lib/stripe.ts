import "server-only";
import Stripe from "stripe";

/* Server-only Stripe client. Test mode until launch — the key in .env.local
   decides; sk_test_* keys can never move real money. */

export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

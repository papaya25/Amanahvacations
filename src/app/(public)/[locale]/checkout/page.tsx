import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getSavedTransfers } from "@/lib/content/addons";
import { getSessionUser } from "@/lib/supabase/serverAuth";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { stripeConfigured } from "@/lib/stripe";
import { paypalConfigured } from "@/lib/paypal";
import { mercadoPagoConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Amanah Vacations booking — enter your details, apply a promo code, and choose how to pay.",
  robots: { index: false },
};

// Session- and cart-specific and noindex — render on demand.
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  // Admin can switch the airport-transfer add-on off; default is on.
  const [transfers, user, dict] = await Promise.all([
    getSavedTransfers(),
    getSessionUser(),
    getDictionary(locale),
  ]);
  const transferEnabled = transfers?.enabled !== false;
  // Only offer payment methods that are actually configured for the current
  // mode (test/live) — so e.g. PayPal isn't shown as an option until its live
  // credentials exist. Order is preserved (card first).
  const availablePayments = [
    stripeConfigured && "stripe",
    paypalConfigured && "paypal",
    mercadoPagoConfigured && "mercadopago",
  ].filter(Boolean) as string[];
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[1100px] px-5 py-[clamp(32px,4vw,64px)] lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            {dict.co_page_eyebrow}
          </div>
          <h1 className="font-serif text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            {dict.co_page_title_1} <em className="italic text-forest">{dict.co_page_title_em}</em>
          </h1>
        </div>
        <CheckoutClient
          transferEnabled={transferEnabled}
          initialName={(user?.user_metadata?.name as string) || ""}
          initialEmail={user?.email ?? ""}
          availablePayments={availablePayments}
        />
      </div>
    </main>
  );
}

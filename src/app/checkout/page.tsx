import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getSavedTransfers } from "@/lib/content/addons";
import { getSessionUser } from "@/lib/supabase/serverAuth";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Amanah Vacations booking — enter your details, apply a promo code, and choose how to pay.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  // Admin can switch the airport-transfer add-on off; default is on.
  const [transfers, user] = await Promise.all([getSavedTransfers(), getSessionUser()]);
  const transferEnabled = transfers?.enabled !== false;
  return (
    <main className="min-h-[70vh] bg-cream">
      <div className="mx-auto max-w-[1100px] px-5 py-[clamp(32px,4vw,64px)] lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[3px] text-terracotta">
            <span aria-hidden className="h-[1.5px] w-[26px] bg-terracotta" />
            Checkout
          </div>
          <h1 className="font-serif text-[clamp(30px,4vw,48px)] font-semibold leading-[1.02] tracking-[-1px] text-ink">
            Almost <em className="italic text-forest">there</em>
          </h1>
        </div>
        <CheckoutClient
          transferEnabled={transferEnabled}
          initialName={(user?.user_metadata?.name as string) || ""}
          initialEmail={user?.email ?? ""}
        />
      </div>
    </main>
  );
}

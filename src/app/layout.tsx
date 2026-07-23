import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import SiteFrame from "@/components/SiteFrame";
import VisitTracker from "@/components/VisitTracker";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import { getContact } from "@/lib/content/contact";
import { getPublicContent } from "@/lib/content/site";
import type { CurrencySettings } from "@/lib/currency";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amanahvacations.com"),
  title: {
    default:
      "Amanah Vacations | Private Tours & Halal-Friendly Trips in the Riviera Maya",
    template: "%s | Amanah Vacations",
  },
  description:
    "Skip the crowds and the noise. Private tours, hidden cenotes, and Caribbean beaches — curated for families and couples who want more than an ordinary holiday. Family-safe, halal-friendly, trusted guides.",
  keywords: [
    "Riviera Maya private tours",
    "halal friendly vacations Mexico",
    "family tours Playa del Carmen",
    "cenotes tour",
    "Tulum tours",
    "luxury travel Riviera Maya",
  ],
  openGraph: {
    type: "website",
    siteName: "Amanah Vacations",
    title: "Amanah Vacations | The Real Riviera Maya",
    description:
      "Private tours, hidden cenotes, and Caribbean beaches — curated for families and couples. Family-safe, halal-friendly, trusted guides.",
    images: ["/images/hero-cenotes.jpg"],
  },
  icons: { icon: "/favicon.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contact, currencySettings] = await Promise.all([
    getContact(),
    getPublicContent<CurrencySettings>("currency", {
      defaultCurrency: "USD",
      rateUSD: 17,
      rateEUR: 19.5,
    }),
  ]);
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${outfit.variable} antialiased`}
      >
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <VisitTracker />
        <CurrencyProvider settings={currencySettings}>
          <CartProvider>
            <SiteFrame contact={contact}>{children}</SiteFrame>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}

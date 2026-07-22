import type { Metadata } from "next";
import PackagesClient from "./PackagesClient";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import { breadcrumbSchema, faqSchema, itemListSchema, productOfferSchema } from "@/lib/seo";
import "./packages.css";

export const metadata: Metadata = {
  title: "Riviera Maya Vacation Packages — Private, Family & Halal-Friendly",
  description:
    "All-in-one Riviera Maya packages built around you: cenotes, Chichén Itzá, Tulum, Akumal, Xcaret parks and more. Essentials, Family, Water, Culture, Honeymoon and VIP — private, family-safe and halal-friendly.",
  keywords: [
    "Riviera Maya packages",
    "Playa del Carmen vacation package",
    "family tour package Mexico",
    "honeymoon Riviera Maya",
    "halal friendly vacation Mexico",
    "private tour package Playa del Carmen",
    "Cancún tour package",
  ],
  alternates: { canonical: "/packages" },
  openGraph: {
    type: "website",
    title: "Riviera Maya Vacation Packages — Private, Family & Halal-Friendly",
    description:
      "Curated multi-day Riviera Maya packages — Essentials, Family, Water, Culture, Honeymoon and VIP. Pick your dates and build the perfect trip.",
    url: "/packages",
    images: ["/images/pkg/honeymoon.jpg"],
  },
};

const PKG_SUMMARY = [
  { name: "The Basics — Essential Riviera Maya", price: 4600, img: "/images/pkg/basic.jpg" },
  { name: "Family Tour — Kid-Friendly Riviera Maya", price: 8200, img: "/images/pkg/family.jpg" },
  { name: "Water Lovers — Beaches, Reefs & Cenotes", price: 7600, img: "/images/pkg/water.jpg" },
  { name: "Indiana Jones — Culture & Wonders", price: 11850, img: "/images/pkg/explorer.jpg" },
  { name: "Honeymoon Escape — Romance & Intimacy", price: 14300, img: "/images/pkg/honeymoon.jpg" },
];

const FAQS = [
  {
    q: "What's included in a Riviera Maya package?",
    a: "Each package bundles private airport transfers, a series of private tours and activities, and a personal WhatsApp concierge. You can add accommodation and extra experiences at checkout. Exactly what's included is listed on each package card.",
  },
  {
    q: "Can I customize a package or build my own?",
    a: "Yes. Every package is a starting point — add or remove activities, choose your accommodation tier, and adjust dates. Or use 'Build Your Own Plan' and our team designs a fully custom itinerary.",
  },
  {
    q: "Are the packages halal-friendly?",
    a: "Yes. We arrange halal dining, private and modest setups, prayer times and alcohol-free villas on request. See our Halal-Friendly Travel page for details.",
  },
  {
    q: "Do prices include hotels?",
    a: "Packages are priced per person for the experiences. Accommodation is optional — choose a hotel tier at checkout and we confirm availability and pricing within 24 hours.",
  },
  {
    q: "How do I pay and is it secure?",
    a: "You can book online with secure card payment (plus PayPal and Mercado Pago), or request a personalized quote and pay by your preferred method. Your booking is confirmed once payment is received.",
  },
];

export default function PackagesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Packages", path: "/packages" },
          ]),
          itemListSchema(PKG_SUMMARY.map((p) => ({ name: p.name, url: "/packages" }))),
          ...PKG_SUMMARY.map((p) =>
            productOfferSchema({
              name: p.name,
              description: `${p.name} — a private Riviera Maya vacation package from Amanah Vacations.`,
              image: p.img,
              url: "/packages",
              priceMXN: p.price,
            })
          ),
          faqSchema(FAQS),
        ]}
      />
      <PackagesClient />
      <Faq items={FAQS} heading="Packages — frequently asked questions" />
    </>
  );
}

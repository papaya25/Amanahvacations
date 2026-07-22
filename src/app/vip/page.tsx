import type { Metadata } from "next";
import VipClient from "./VipClient";
import "./vip.css";

export const metadata: Metadata = {
  title: "VIP Experience — Luxury Without Limits",
  description:
    "A fully personalized VIP journey in the Riviera Maya: private transportation, dedicated guide, 24/7 concierge, yacht experiences, private chef, luxury villas and the region's finest resorts.",
};

export default function VipPage() {
  return (
    <main>
      <VipClient />
    </main>
  );
}

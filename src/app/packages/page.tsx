import type { Metadata } from "next";
import PackagesClient from "./PackagesClient";
import "./packages.css";

export const metadata: Metadata = {
  title: "Packages — Choose Your Perfect Plan",
  description:
    "Six curated Riviera Maya packages — Essentials, Family, Water Lovers, Culture, Honeymoon and VIP. Pick your dates, group size and add-ons, see transparent prices, and book online or get a personal quote.",
};

export default function PackagesPage() {
  return <PackagesClient />;
}

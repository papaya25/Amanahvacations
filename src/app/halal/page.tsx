import type { Metadata } from "next";
import HalalClient from "./HalalClient";
import "./halal.css";

export const metadata: Metadata = {
  title: "Halal-Friendly Travel — Travel With Peace of Mind",
  description:
    "Halal travel in the Riviera Maya: halal-certified dining and private chefs, alcohol-free private villas, prayer and Qibla arrangements, modest beach setups, and family-first experiences.",
};

export default function HalalPage() {
  return (
    <main>
      <HalalClient />
    </main>
  );
}

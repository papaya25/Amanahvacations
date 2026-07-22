import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import ToursClient from "./ToursClient";
import "./tours.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Our Tours — Private Day Trips in the Riviera Maya",
  description:
    "Private, guided day adventures across the Riviera Maya and Yucatán: cenotes, Tulum, Cobá, Chichén Itzá, Cozumel reefs, Holbox and Isla Contoy. Pick your date and group size — every tour is just for your group.",
};

export default function ToursPage() {
  return (
    <main className={caveat.variable}>
      <ToursClient />
    </main>
  );
}

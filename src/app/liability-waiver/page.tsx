import type { Metadata } from "next";
import { BODY, TITLE } from "./content";
import "@/data/legal/legal.css";

export const metadata: Metadata = {
  title: "Liability Waiver",
  description: "Adventure activity waiver and assumption of risk for cenotes, snorkeling, ziplines, boat trips and other Amanah Vacations experiences.",
};

export default function Page() {
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: BODY }} />
  );
}

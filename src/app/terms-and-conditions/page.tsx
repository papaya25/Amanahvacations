import type { Metadata } from "next";
import { BODY, TITLE } from "./content";
import "@/data/legal/legal.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Booking terms, payment, cancellation and refund policy for Amanah Vacations packages and tours.",
};

export default function Page() {
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: BODY }} />
  );
}

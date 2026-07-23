import type { Metadata } from "next";
import { BODY, TITLE } from "./content";
import { getLegalDoc, renderLegalHtml } from "@/lib/content/legal";
import "@/data/legal/legal.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Booking terms, payment, cancellation and refund policy for Amanah Vacations packages and tours.",
};

export default async function Page() {
  // Admin-saved text replaces the built-in document; otherwise the rich
  // generated version stays (see src/lib/content/legal.ts for the guard).
  const saved = await getLegalDoc("terms");
  const html = saved ? renderLegalHtml(TITLE, saved) : BODY;
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

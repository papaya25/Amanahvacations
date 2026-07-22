import type { Metadata } from "next";
import { BODY, TITLE } from "./content";
import "@/data/legal/legal.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Amanah Vacations collects, uses, protects and shares your personal data, including your ARCO rights under Mexican law.",
};

export default function Page() {
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: BODY }} />
  );
}

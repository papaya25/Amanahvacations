import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { BODY, TITLE } from "./content";
import { getLegalDoc, renderLegalHtml } from "@/lib/content/legal";
import { translateHtml } from "@/lib/i18n/translate";
import { isLocale, type Locale } from "@/lib/i18n/config";
import "@/data/legal/legal.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {

  title: "Terms & Conditions",
  description: "Booking terms, payment, cancellation and refund policy for Amanah Vacations packages and tours.",
    alternates: pageAlternates(locale, "/terms-and-conditions"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  // Admin-saved text replaces the built-in document; otherwise the rich
  // generated version stays (see src/lib/content/legal.ts for the guard).
  const saved = await getLegalDoc("terms");
  const html = await translateHtml(saved ? renderLegalHtml(TITLE, saved) : BODY, locale);
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

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

  title: "Liability Waiver",
  description: "Adventure activity waiver and assumption of risk for cenotes, snorkeling, ziplines, boat trips and other Amanah Vacations experiences.",
    alternates: pageAlternates(locale, "/liability-waiver"),
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
  const saved = await getLegalDoc("waiver");
  const html = await translateHtml(saved ? renderLegalHtml(TITLE, saved) : BODY, locale);
  return (
    <main className="legal-page" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

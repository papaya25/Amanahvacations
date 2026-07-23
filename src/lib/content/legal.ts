/* Legal documents — /admin/legal stores plain-text bodies. The public pages
   keep their rich built-in HTML (TOC, tables, callouts) until the admin saves
   real text; a saved body is escaped and rendered as paragraphs in the same
   legal-page styling. The admin editor's untouched placeholder text is treated
   as "not saved" so it can never replace the real documents. */

import { getSavedContent } from "@/lib/content/site";

export type LegalDoc = { updated: string; body: string };
export type LegalContent = { terms: LegalDoc; privacy: LegalDoc; waiver: LegalDoc };

const PLACEHOLDER_MARKER = "content is published from the current version on the site";

export async function getLegalDoc(key: keyof LegalContent): Promise<LegalDoc | null> {
  const saved = await getSavedContent<LegalContent>("legal");
  const doc = saved?.[key];
  if (!doc?.body?.trim() || doc.body.includes(PLACEHOLDER_MARKER)) return null;
  return doc;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Render an admin-saved plain-text legal doc in the standard legal-page chrome. */
export function renderLegalHtml(title: string, doc: LegalDoc): string {
  const paragraphs = doc.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
  return `<div class="legal-header">
  <div class="legal-eyebrow">Amanah Vacations</div>
  <h1 class="legal-title">${escapeHtml(title)}</h1>
  <p class="legal-updated">Last updated: ${escapeHtml(doc.updated)}</p>
</div>
<div class="legal-wrap">
  <a href="/" class="back-link">← Back to Amanah Vacations</a>
  <div class="legal-section">${paragraphs}</div>
</div>`;
}

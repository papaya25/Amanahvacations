import "server-only";

import type { Metadata } from "next";
import { translateMany } from "./translate";
import { isLocale } from "./config";

/** Translate a page's title + descriptions (incl. Open Graph / Twitter) into
    the page locale through the same cached translator as the body copy, so
    /fr /es /ar results in Google show a headline in their own language. */
export async function localizeMetadata(locale: string, m: Metadata): Promise<Metadata> {
  if (!isLocale(locale) || locale === "en") return m;

  const og = (m.openGraph ?? {}) as { title?: unknown; description?: unknown };
  const tw = (m.twitter ?? {}) as { title?: unknown; description?: unknown };
  const t = m.title as unknown;
  const titleObj = t && typeof t === "object" ? (t as { default?: string; absolute?: string; template?: string }) : null;

  // Every translatable slot as [read, write] so one translateMany call covers them all.
  const slots: [string | undefined, (v: string) => void][] = [
    [typeof t === "string" ? t : undefined, (v) => (m.title = v)],
    [titleObj?.default, (v) => (titleObj!.default = v)],
    [titleObj?.absolute, (v) => (titleObj!.absolute = v)],
    [m.description ?? undefined, (v) => (m.description = v)],
    [typeof og.title === "string" ? og.title : undefined, (v) => (og.title = v)],
    [typeof og.description === "string" ? og.description : undefined, (v) => (og.description = v)],
    [typeof tw.title === "string" ? tw.title : undefined, (v) => (tw.title = v)],
    [typeof tw.description === "string" ? tw.description : undefined, (v) => (tw.description = v)],
  ];
  const used = slots.filter(([v]) => v);
  const out = await translateMany(used.map(([v]) => v!), locale);
  used.forEach(([, set], i) => set(out[i]));
  return m;
}

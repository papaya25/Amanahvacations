import "server-only";

/* AI-powered translation with a permanent cache. Every distinct English
   string is translated once per language and stored in the `translations`
   table (keyed by a hash of the source text, so an edit to the source
   produces a fresh translation instead of reusing a stale one). If anything
   goes wrong — no API credits, rate limit, network error — every call falls
   back to the original English text so the site never breaks or shows
   errors to a visitor. */

import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "./config";
import { LOCALE_NAMES } from "./config";
import { OVERRIDES } from "./overrides";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

async function getCached(locale: string, hashes: string[]): Promise<Map<string, string>> {
  if (hashes.length === 0) return new Map();
  const out = new Map<string, string>();
  try {
    const supabase = createAdminClient();
    // Chunk the lookup: hundreds of 64-char hashes in one `.in()` filter build
    // a URL past common length limits and the whole query silently fails
    // (which is how the ~280-entry dictionary lookup broke). Dedupe first —
    // the same text often appears under several dictionary keys.
    const unique = [...new Set(hashes)];
    for (let i = 0; i < unique.length; i += 100) {
      const { data, error } = await supabase
        .from("translations")
        .select("source_hash,translated")
        .eq("locale", locale)
        .in("source_hash", unique.slice(i, i + 100));
      if (error) {
        console.error("getCached:", error.message);
        continue;
      }
      (data ?? []).forEach((r) => out.set(r.source_hash, r.translated));
    }
  } catch (e) {
    console.error("getCached:", e instanceof Error ? e.message : e);
  }
  return out;
}

async function storeCached(
  locale: string,
  rows: { source_hash: string; source_text: string; translated: string }[]
): Promise<void> {
  if (rows.length === 0) return;
  try {
    // Deduplicate by hash: the same English text can appear multiple times in
    // one batch (e.g. "Total" used on several pages), and Postgres rejects an
    // upsert that touches the same (locale, source_hash) row twice — which
    // would silently drop the WHOLE batch.
    const unique = [...new Map(rows.map((r) => [r.source_hash, r])).values()];
    const { error } = await supabase_upsert(locale, unique);
    if (error) console.error("storeCached:", error.message);
  } catch (e) {
    console.error("storeCached:", e instanceof Error ? e.message : e);
  }
}

function supabase_upsert(
  locale: string,
  rows: { source_hash: string; source_text: string; translated: string }[]
) {
  const supabase = createAdminClient();
  return supabase
    .from("translations")
    .upsert(
      rows.map((r) => ({ locale, ...r })),
      { onConflict: "locale,source_hash" }
    );
}

/** Extract the first complete, balanced JSON array from a model response,
    ignoring any prose or extra characters before/after it (or a second array).
    Bracket depth is tracked with string/escape awareness so brackets inside
    translated strings don't confuse it. Returns null if no array is found. */
function extractJsonArray(text: string): string | null {
  const start = text.indexOf("[");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (c === "\\") {
      esc = true;
      continue;
    }
    if (c === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Ask Claude to translate a batch of strings in one call (cheap + fast:
    Haiku 4.5 is plenty for short UI/content strings). Returns null on any
    failure so the caller can fall back to English. */
async function translateBatch(texts: string[], locale: Locale): Promise<string[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system:
        `Translate each numbered English string to ${LOCALE_NAMES[locale]} for a travel/tourism website. ` +
        `Keep the tone warm and professional. Preserve any {{placeholders}}, HTML tags, and punctuation style. ` +
        `Keep proper place and brand names in their original form (e.g. Cancún, Tulum, Chichén Itzá, Xcaret, Cozumel, Holbox, Sian Ka'an, Riviera Maya, Rosewood Mayakoba, PayPal), ` +
        `but ALWAYS translate the ordinary descriptive words around them — words like Tour, Park, Visit, Sanctuary, Aquarium, Lagoon, Guided, Private, City, Beach, Reserve, Overnight, Lessons, Snorkeling. ` +
        `For example "Cenote Visit", "Cancún City Tour", "Monkey Sanctuary", "Xcaret Park" must become natural ${LOCALE_NAMES[locale]}. ` +
        `Never leave a phrase entirely in English unless it is purely a proper name or brand. ` +
        `Reply with ONLY a JSON array of translated strings, same order, same length as the input — no other text.`,
      messages: [
        {
          role: "user",
          content: texts.map((t, i) => `${i + 1}. ${t}`).join("\n"),
        },
      ],
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const jsonArray = extractJsonArray(text);
    if (!jsonArray) return null;
    const parsed = JSON.parse(jsonArray);
    if (!Array.isArray(parsed) || parsed.length !== texts.length) return null;
    return parsed.map((s) => String(s));
  } catch (e) {
    console.error("translateBatch:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Translate a batch of strings to `locale`, using the cache where possible.
    English passes through untouched. Never throws; always returns an
    English-parallel array of equal length. */
export async function translateMany(texts: string[], locale: Locale): Promise<string[]> {
  if (locale === "en" || texts.length === 0) return texts;

  // Hand-curated overrides win over cache and AI, and are never sent to the
  // model — so brand/travel terms are always correct and consistent.
  const overrides = OVERRIDES[locale] ?? {};

  const hashes = texts.map(hash);
  const cached = await getCached(locale, hashes);

  const missing: { text: string; hash: string; index: number }[] = [];
  const queued = new Set<string>();
  texts.forEach((text, index) => {
    const h = hashes[index];
    if (!overrides[text] && !cached.has(h) && !queued.has(h)) {
      queued.add(h);
      missing.push({ text, hash: h, index });
    }
  });

  if (missing.length > 0) {
    // Chunk the outstanding strings so a large page (e.g. a full legal
    // document) never exceeds the model's output limit in one call — each
    // chunk stays under a conservative character budget and item count.
    for (const chunk of chunkByBudget(missing)) {
      const translated = await translateBatch(
        chunk.map((m) => m.text),
        locale
      );
      if (!translated) continue; // this chunk falls back to English
      // Claude occasionally returns a blank string for a very short entry in a
      // batch — never cache or serve that as a "translation" over real text.
      const rows = chunk.map((m, i) => ({
        source_hash: m.hash,
        source_text: m.text,
        translated: translated[i]?.trim() ? translated[i] : m.text,
      }));
      rows.forEach((r) => cached.set(r.source_hash, r.translated));
      await storeCached(locale, rows);
    }
  }

  return texts.map((text, index) => overrides[text] || cached.get(hashes[index]) || text);
}

/** Split items into chunks small enough to translate in one model call. */
function chunkByBudget<T extends { text: string }>(items: T[]): T[][] {
  const MAX_CHARS = 4000;
  const MAX_ITEMS = 40;
  const chunks: T[][] = [];
  let cur: T[] = [];
  let chars = 0;
  for (const item of items) {
    const len = item.text.length;
    if (cur.length > 0 && (chars + len > MAX_CHARS || cur.length >= MAX_ITEMS)) {
      chunks.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(item);
    chars += len;
  }
  if (cur.length > 0) chunks.push(cur);
  return chunks;
}

/** Translate a single string. Convenience wrapper over translateMany. */
export async function translateOne(text: string, locale: Locale): Promise<string> {
  const [result] = await translateMany([text], locale);
  return result;
}

/** Translate every value in a flat string dictionary, preserving keys. */
export async function translateDict<T extends Record<string, string>>(
  dict: T,
  locale: Locale
): Promise<T> {
  if (locale === "en") return dict;
  const keys = Object.keys(dict) as (keyof T)[];
  const values = await translateMany(
    keys.map((k) => dict[k]),
    locale
  );
  const out = { ...dict };
  keys.forEach((k, i) => {
    out[k] = values[i] as T[keyof T];
  });
  return out;
}

/** Translate only the visible text of an HTML string, leaving every tag,
    attribute, href and CSS class untouched. Text nodes are extracted, sent
    through the batched/cached translator, and slotted back in place — so the
    document structure is guaranteed identical to the source. Falls back to the
    original HTML wholesale on any failure. */
export async function translateHtml(html: string, locale: Locale): Promise<string> {
  if (locale === "en" || !html) return html;
  try {
    // Split on tags: even indices are text between tags, odd indices are tags.
    const parts = html.split(/(<[^>]+>)/g);
    const jobs: { partIndex: number; text: string }[] = [];
    parts.forEach((p, i) => {
      if (i % 2 === 0 && p.trim().length > 0) jobs.push({ partIndex: i, text: p });
    });
    if (jobs.length === 0) return html;

    // Translate the trimmed core of each text node, preserving surrounding
    // whitespace so inline spacing between tags is not lost.
    const cores = jobs.map((j) => j.text.trim());
    const translated = await translateMany(cores, locale);
    jobs.forEach((j, i) => {
      const original = parts[j.partIndex];
      const leading = original.match(/^\s*/)?.[0] ?? "";
      const trailing = original.match(/\s*$/)?.[0] ?? "";
      parts[j.partIndex] = leading + translated[i] + trailing;
    });
    return parts.join("");
  } catch {
    return html;
  }
}

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

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

async function getCached(locale: string, hashes: string[]): Promise<Map<string, string>> {
  if (hashes.length === 0) return new Map();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("translations")
      .select("source_hash,translated")
      .eq("locale", locale)
      .in("source_hash", hashes);
    if (error) return new Map();
    return new Map((data ?? []).map((r) => [r.source_hash, r.translated]));
  } catch {
    return new Map();
  }
}

async function storeCached(
  locale: string,
  rows: { source_hash: string; source_text: string; translated: string }[]
): Promise<void> {
  if (rows.length === 0) return;
  try {
    const supabase = createAdminClient();
    await supabase
      .from("translations")
      .upsert(
        rows.map((r) => ({ locale, ...r })),
        { onConflict: "locale,source_hash" }
      );
  } catch {
    /* cache write is best-effort */
  }
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
      max_tokens: 4096,
      system:
        `Translate each numbered English string to ${LOCALE_NAMES[locale]} for a travel/tourism website. ` +
        `Keep the tone warm and professional. Preserve any {{placeholders}}, HTML tags, and punctuation style. ` +
        `Keep names of places (Cancún, Tulum, Riviera Maya, etc.) unchanged. ` +
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
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
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

  const hashes = texts.map(hash);
  const cached = await getCached(locale, hashes);

  const missing: { text: string; hash: string; index: number }[] = [];
  texts.forEach((text, index) => {
    if (!cached.has(hashes[index])) missing.push({ text, hash: hashes[index], index });
  });

  if (missing.length > 0) {
    const translated = await translateBatch(
      missing.map((m) => m.text),
      locale
    );
    if (translated) {
      // Claude occasionally returns a blank string for a very short entry in a
      // batch — never cache or serve that as a "translation" over real text.
      const rows = missing.map((m, i) => ({
        source_hash: m.hash,
        source_text: m.text,
        translated: translated[i]?.trim() ? translated[i] : m.text,
      }));
      rows.forEach((r) => cached.set(r.source_hash, r.translated));
      await storeCached(locale, rows);
    }
  }

  return texts.map((text, index) => cached.get(hashes[index]) || text);
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

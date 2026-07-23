/* Public (read-only) Supabase client for server-rendered pages.
   Uses the publishable/anon key, which is safe to expose. Row-level security
   on the database restricts this key to SELECT only — it can read published
   content but can never write. Admin writes use the server-only admin client. */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the Supabase env vars are present. Lets pages fall back to their
    built-in content if the backend isn't configured (e.g. local dev without .env). */
export const supabaseConfigured = Boolean(url && anonKey);

export function createPublicClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)");
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/* Server-only Supabase client with full write access.

   Uses the service_role secret key, which BYPASSES row-level security. It must
   NEVER reach the browser: no NEXT_PUBLIC_ prefix, and only import this from
   server code (server actions, route handlers, server components). */

import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the admin (write) key is configured. */
export const adminConfigured = Boolean(url && serviceKey);

export function createAdminClient() {
  if (!url || !serviceKey) {
    throw new Error(
      "Admin Supabase client not configured — set SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

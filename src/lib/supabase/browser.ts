"use client";

/* Browser Supabase client for customer auth (login/signup/logout). Uses the
   public key; sessions are stored in cookies so the server can see them too. */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

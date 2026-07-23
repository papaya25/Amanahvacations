"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/serverAuth";

export async function logoutCustomer(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/");
}

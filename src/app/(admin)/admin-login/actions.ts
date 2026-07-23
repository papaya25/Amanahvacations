"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/adminAuth";

export async function loginAdmin(formData: FormData): Promise<{ error: string } | void> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) return { error: "Admin login isn't configured (ADMIN_PASSWORD missing)." };
  if (password !== expected) return { error: "Wrong password. Please try again." };

  const { token, maxAge } = await createAdminToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  // Only allow internal admin destinations to avoid open redirects.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin-login");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createProfitsToken, PROFITS_COOKIE } from "@/lib/adminAuth";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function unlockProfits(formData: FormData): Promise<{ error: string } | void> {
  if (!(await isAdminRequest())) return { error: "Please log in to the admin first." };
  const password = String(formData.get("password") ?? "");
  const expected = process.env.PROFITS_PASSWORD;
  if (!expected) return { error: "Profits password isn't configured (PROFITS_PASSWORD)." };
  if (password !== expected) return { error: "Wrong password." };
  const { token, maxAge } = await createProfitsToken();
  const jar = await cookies();
  jar.set(PROFITS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge,
  });
  redirect("/admin/profits");
}

export async function lockProfits(): Promise<void> {
  const jar = await cookies();
  jar.delete(PROFITS_COOKIE);
  redirect("/admin");
}

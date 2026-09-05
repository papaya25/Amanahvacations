import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

/** True when the current request carries a valid admin session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  // TEMPORARY kill-switch — see src/proxy.ts. ADMIN_OPEN=1 disables the
  // admin login entirely (Maher's explicit request); remove the env var +
  // redeploy to re-lock.
  if (process.env.ADMIN_OPEN === "1") return true;
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

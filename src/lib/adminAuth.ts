/* Admin session tokens. A successful login sets an HttpOnly cookie holding
   `<expiry>.<signature>` where the signature is an HMAC of the expiry with
   ADMIN_SESSION_SECRET — unforgeable without the secret, verifiable in both
   the proxy (edge) and server actions. This is the interim gate until full
   Supabase Auth accounts land in Step 2; the checks live server-side only.

   NOTE: imported by the proxy (edge runtime), so keep this file free of
   Node-only APIs — Web Crypto only. */

export const ADMIN_COOKIE = "amanah_admin";
export const PROFITS_COOKIE = "amanah_profits";
const SESSION_DAYS = 30;

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function createToken(prefix: string): Promise<{ token: string; maxAge: number }> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = `${exp}.${await hmac(secret, prefix + exp)}`;
  return { token, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

async function verifyToken(prefix: string, token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(secret, prefix + expStr);
  // Constant-time-ish comparison.
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const createAdminToken = () => createToken("admin:");
export const verifyAdminToken = (token: string | undefined) => verifyToken("admin:", token);

/* Profits is Maher's extra-restricted area: its own password on top of the
   admin login, with its own cookie. */
export const createProfitsToken = () => createToken("profits:");
export const verifyProfitsToken = (token: string | undefined) => verifyToken("profits:", token);

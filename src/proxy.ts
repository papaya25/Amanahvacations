import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { DEFAULT_LOCALE, isLocale, stripLocale, type Locale } from "@/lib/i18n/config";

/* Three concerns, in order:
   1. /admin* → Maher's password cookie (admin is never locale-prefixed).
   2. /admin-login → left alone (the admin login page itself).
   3. Everything else → locale resolution, then the existing customer-session
      gates (/account/*, /login), now locale-aware.

   Locale strategy: English is the default and stays UNPREFIXED in the visible
   URL (amanahvacations.com/packages) — internally rewritten to /en/packages
   so it resolves inside the [locale] route tree. French/Spanish/Arabic are
   real prefixes (/fr/packages) with no rewrite. This keeps every existing
   internal link working unchanged for English visitors. */

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (await verifyAdminToken(token)) return NextResponse.next();
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname === "/admin-login") return NextResponse.next();

  const segments = pathname.split("/");
  const hasLocalePrefix = isLocale(segments[1] ?? "");
  const locale: Locale = hasLocalePrefix ? (segments[1] as Locale) : DEFAULT_LOCALE;
  const localeFreePath = stripLocale(pathname);

  const rewriteUrl = hasLocalePrefix ? null : request.nextUrl.clone();
  if (rewriteUrl) rewriteUrl.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;

  const buildResponse = () =>
    rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request });

  let response = buildResponse();

  // Customer session refresh (keeps auth cookies fresh on account/login pages).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = buildResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (localeFreePath.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL(request.url);
      loginUrl.pathname = hasLocalePrefix ? `/${locale}/login` : "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", localeFreePath);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (localeFreePath === "/login" && user) {
    const next = request.nextUrl.searchParams.get("next");
    const dest = next && next.startsWith("/account") ? next : "/account/orders";
    const url = new URL(request.url);
    url.pathname = hasLocalePrefix ? `/${locale}${dest}` : dest;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals, and files with an
  // extension (images, etc). Admin paths ARE matched so the gate above runs.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

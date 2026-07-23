import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

/* Two gates:
   - /admin/*  → Maher's password cookie (login page lives at /admin-login).
   - /account/* → a logged-in customer (Supabase Auth session).
   /login is included in the matcher so customer sessions get refreshed there
   (and logged-in visitors can be bounced to their account). */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (await verifyAdminToken(token)) return NextResponse.next();
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Customer session refresh (keeps auth cookies fresh on account/login pages).
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
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

  if (pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login" && user) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(
      new URL(next && next.startsWith("/account") ? next : "/account/orders", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account/:path*", "/login"],
};

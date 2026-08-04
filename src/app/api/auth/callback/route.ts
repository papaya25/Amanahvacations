import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/* OAuth return leg (Google/Facebook login). Supabase redirects here with a
   one-time ?code= after the provider approves; we exchange it for a session
   (cookies set on the redirect response) and send the customer on to their
   account. Lives under /api so the locale proxy never rewrites it. */

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Only allow same-site destinations; default to the account area.
  const rawNext = url.searchParams.get("next") ?? "/account/orders";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account/orders";
  const dest = new URL(next, url.origin);

  if (!code) return NextResponse.redirect(new URL("/login", url.origin));

  const response = NextResponse.redirect(dest);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("oauth callback:", error.message);
    return NextResponse.redirect(new URL("/login?oauth_error=1", url.origin));
  }
  return response;
}

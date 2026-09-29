import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 1. /account/*: signed-in users only. Signed-out visitors go to /auth/login with a
//    ?redirect= back to the page they wanted. Also refreshes the Supabase session cookie.
// 2. /admin and /api/enrich: password-protected (below).
//
// Password-protects the admin page and the AI enrichment endpoint it uses.
// Set ADMIN_PASSWORD in .env.local and in Vercel → Settings → Environment Variables.
// The browser shows a login prompt; any username works, only the password is checked.
// If ADMIN_PASSWORD isn't set, admin stays locked for everyone.

export const config = {
  matcher: ["/admin/:path*", "/api/enrich/:path*", "/account", "/account/:path*"],
};

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/account" || req.nextUrl.pathname.startsWith("/account/")) {
    return requireUser(req);
  }
  return requireAdminPassword(req);
}

async function requireUser(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => res.headers.set(k, v));
      },
    },
  });
  // getUser() checks the session with Supabase Auth rather than trusting the cookie alone.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = req.nextUrl.clone();
    login.pathname = "/auth/login";
    login.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(login);
  }
  return res;
}

function requireAdminPassword(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const header = req.headers.get("authorization");

  if (password && header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const supplied = decoded.slice(decoded.indexOf(":") + 1);
      if (safeEqual(supplied, password)) return NextResponse.next();
    } catch {
      // Malformed header — fall through to the login prompt.
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Pello admin", charset="UTF-8"' },
  });
}

// Compares in constant time so the password can't be guessed character by character.
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

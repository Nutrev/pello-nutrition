import { NextRequest, NextResponse } from "next/server";

// Password-protects the admin page and the AI enrichment endpoint it uses.
// Set ADMIN_PASSWORD in .env.local and in Vercel → Settings → Environment Variables.
// The browser shows a login prompt; any username works, only the password is checked.
// If ADMIN_PASSWORD isn't set, admin stays locked for everyone.

export const config = {
  matcher: ["/admin/:path*", "/api/enrich/:path*"],
};

export function middleware(req: NextRequest) {
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

// Finishes email confirmation, password-reset links and Google sign-in: swaps the code
// in the link for a session cookie, then continues to ?next= (same-site paths only).
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeRedirect(url.searchParams.get("next"));

  if (code) {
    const { error } = await getServerSupabase().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const login = new URL("/auth/login", url.origin);
  login.searchParams.set("error", "link");
  return NextResponse.redirect(login);
}

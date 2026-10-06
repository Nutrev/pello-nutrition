import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { INTERVALS_ENABLED, STATE_COOKIE, canUseIntervals, exchangeCode, saveConnection } from "@/lib/intervals";
import { safeRedirect } from "@/lib/safe-redirect";

// Per member and per request: never cached at build time.
export const dynamic = "force-dynamic";

// intervals.icu sends the member back here after they approve (or decline) the connection.
// Registered as the app's redirect URL: https://www.pellonutrition.com/api/intervals/callback
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const params = req.nextUrl.searchParams;
  let saved: { state?: string; back?: string } = {};
  try { saved = JSON.parse(req.cookies.get(STATE_COOKIE)?.value ?? "{}"); } catch {}
  const back = safeRedirect(saved.back, "/account");
  const finish = (result: "connected" | "declined" | "failed") => {
    const url = new URL(back, origin);
    url.searchParams.set("intervals", result);
    const res = NextResponse.redirect(url);
    res.cookies.set(STATE_COOKIE, "", { maxAge: 0, path: "/api/intervals" });
    return res;
  };

  if (!INTERVALS_ENABLED) return finish("failed");
  if (params.get("error")) return finish("declined");
  const code = params.get("code");
  if (!code || !saved.state || params.get("state") !== saved.state) return finish("failed");

  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user || !(await canUseIntervals(user.id))) return finish("failed");

  try {
    await saveConnection(user.id, await exchangeCode(code));
    return finish("connected");
  } catch (e) {
    console.error("intervals.icu connect error:", e);
    return finish("failed");
  }
}

// lib/safe-redirect.ts
// Only same-site paths are allowed as redirect targets, so a link like
// /auth/login?redirect=https://evil.example can't send people off the site.
export function safeRedirect(target: string | null | undefined, fallback = "/account"): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return fallback;
  return target;
}

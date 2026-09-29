import { redirect } from "next/navigation";

// Sign-up lives on the login page's "Create account" tab.
export default function SignupPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const params = new URLSearchParams({ mode: "signup" });
  if (searchParams.redirect) params.set("redirect", searchParams.redirect);
  redirect(`/auth/login?${params}`);
}

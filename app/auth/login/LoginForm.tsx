"use client";

// One page for both logging in and creating an account, switched with tabs.
// ?mode=signup opens the "Create account" tab; ?redirect= is where to go afterwards.
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp, friendlyAuthError, onboardingPath } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthShell, Field, ErrorNote, Divider, GoogleButton, inputClass } from "@/components/auth/AuthUI";

type Mode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirect = safeRedirect(redirectParam);                  // after logging in
  const then = redirectParam ? safeRedirect(redirectParam) : undefined; // after onboarding
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That link has expired or was already used. Please try again." : null,
  );
  const [sentTo, setSentTo] = useState<string | null>(null);

  const switchTo = (m: Mode) => { setMode(m); setError(null); };

  const logIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await signIn(email.trim(), password);
    if (error) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    router.replace(redirect);
    router.refresh();
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Please use at least 8 characters for your password."); return; }
    if (!agreed) { setError("Please agree to the Terms of Service and Privacy Policy."); return; }
    setBusy(true); setError(null);
    const { data, error } = await signUp(email.trim(), password, then);
    if (error) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    if (data.session) {
      router.replace(onboardingPath(then));
      router.refresh();
    } else {
      setSentTo(email.trim()); // email confirmation is on: the link finishes sign-up
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell eyebrow="Almost there" title="Check your email">
        <p className="text-sm leading-relaxed mb-4">
          We&apos;ve sent a confirmation link to <strong>{sentTo}</strong>. Open it to finish creating your account.
          You&apos;ll then set up your profile.
        </p>
        <p className="text-xs text-muted">
          Can&apos;t find it? Check your spam folder, or{" "}
          <button type="button" onClick={() => setSentTo(null)} className="text-moss hover:underline">try a different email</button>.
        </p>
      </AuthShell>
    );
  }

  const signup = mode === "signup";
  return (
    <AuthShell
      eyebrow="Pello account"
      title={signup ? "Create your account" : "Welcome back"}
      subtitle={signup ? "Free. Save plans, favorite products and track your supplement stack." : "Log in to see your saved plans, favorites and stack."}
    >
      <div role="tablist" aria-label="Log in or create an account" className="grid grid-cols-2 rounded-xl border border-sand bg-white/40 p-1 mb-5">
        {([["login", "Log in"], ["signup", "Create account"]] as const).map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchTo(m)}
            className={`py-2 text-sm rounded-lg transition-colors ${mode === m ? "bg-moss text-cream font-medium" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      <GoogleButton next={signup ? onboardingPath(then) : redirect} />
      <Divider />

      <form onSubmit={signup ? createAccount : logIn} noValidate>
        <ErrorNote message={error} />
        <Field label="Email">
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Password" hint={signup ? "At least 8 characters" : undefined}>
          <input type="password" autoComplete={signup ? "new-password" : "current-password"} required
            value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>

        {signup ? (
          <label className="flex items-start gap-2 text-sm mb-5 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-moss" />
            <span className="text-muted">
              I agree to the <Link href="/legal/terms" target="_blank" className="text-moss hover:underline">Terms of Service</Link> and{" "}
              <Link href="/legal/privacy" target="_blank" className="text-moss hover:underline">Privacy Policy</Link>.
            </span>
          </label>
        ) : (
          <div className="flex justify-end -mt-2 mb-4">
            <Link href="/auth/reset-password" className="text-xs text-moss hover:underline">Forgot password?</Link>
          </div>
        )}

        <button type="submit" disabled={busy || !email || !password} className="btn-primary w-full justify-center flex disabled:opacity-50">
          {busy ? (signup ? "Creating account…" : "Logging in…") : (signup ? "Create account" : "Log in")}
        </button>
      </form>
    </AuthShell>
  );
}

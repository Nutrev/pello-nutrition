"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, friendlyAuthError, onboardingPath } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthShell, Field, ErrorNote, Divider, GoogleButton, inputClass } from "@/components/auth/AuthUI";

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"), "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Please use at least 8 characters for your password."); return; }
    if (!agreed) { setError("Please agree to the Terms of Service and Privacy Policy."); return; }
    setBusy(true); setError(null);
    const { data, error } = await signUp(email.trim(), password, redirect || undefined);
    if (error) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    if (data.session) {
      router.replace(onboardingPath(redirect || undefined));
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
        <p className="text-xs text-muted">Can&apos;t find it? Check your spam folder, or <button type="button" onClick={() => setSentTo(null)} className="text-moss hover:underline">try a different email</button>.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Free account" title="Create your Pello account" subtitle="Save plans, favourite products and track your supplement stack.">
      <GoogleButton next={onboardingPath(redirect || undefined)} label="Sign up with Google" />
      <Divider />
      <form onSubmit={submit} noValidate>
        <ErrorNote message={error} />
        <Field label="Email">
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <label className="flex items-start gap-2 text-sm mb-5 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-moss" />
          <span className="text-muted">
            I agree to the <Link href="/legal/terms" target="_blank" className="text-moss hover:underline">Terms of Service</Link> and{" "}
            <Link href="/legal/privacy" target="_blank" className="text-moss hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        <button type="submit" disabled={busy || !email || !password} className="btn-primary w-full justify-center flex disabled:opacity-50">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-muted text-center mt-5">
        Already have an account?{" "}
        <Link href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-moss font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

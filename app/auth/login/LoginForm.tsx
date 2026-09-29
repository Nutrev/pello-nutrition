"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, friendlyAuthError } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthShell, Field, ErrorNote, Divider, GoogleButton, inputClass } from "@/components/auth/AuthUI";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That link has expired or was already used. Please try again." : null,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await signIn(email.trim(), password);
    if (error) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    router.replace(redirect);
    router.refresh();
  };

  return (
    <AuthShell eyebrow="Pello account" title="Welcome back" subtitle="Sign in to see your saved plans, favourites and stack.">
      <GoogleButton next={redirect} />
      <Divider />
      <form onSubmit={submit} noValidate>
        <ErrorNote message={error} />
        <Field label="Email">
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <div className="flex justify-end -mt-2 mb-4">
          <Link href="/auth/reset-password" className="text-xs text-moss hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={busy || !email || !password} className="btn-primary w-full justify-center flex disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-muted text-center mt-5">
        New to Pello?{" "}
        <Link href={`/auth/signup${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-moss font-medium hover:underline">
          Create a free account
        </Link>
      </p>
    </AuthShell>
  );
}

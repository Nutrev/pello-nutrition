"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordReset, friendlyAuthError } from "@/lib/auth";
import { AuthShell, Field, ErrorNote, inputClass } from "@/components/auth/AuthUI";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await sendPasswordReset(email.trim());
    // Only rate limits are shown; otherwise the same message appears whether or not
    // the email has an account, so the form can't be used to find out who's registered.
    if (error && /rate|too many/i.test(error.message)) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    setSent(true); setBusy(false);
  };

  return (
    <AuthShell eyebrow="Password reset" title={sent ? "Check your email" : "Reset your password"}
      subtitle={sent ? undefined : "Enter your email and we'll send you a link to choose a new password."}>
      {sent ? (
        <>
          <p className="text-sm leading-relaxed mb-4">
            If there&apos;s an account for <strong>{email.trim()}</strong>, a reset link is on its way. It expires after an hour.
          </p>
          <Link href="/auth/login" className="btn-secondary w-full justify-center flex">Back to log in</Link>
        </>
      ) : (
        <form onSubmit={submit} noValidate>
          <ErrorNote message={error} />
          <Field label="Email">
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <button type="submit" disabled={busy || !email} className="btn-primary w-full justify-center flex disabled:opacity-50">
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-sm text-muted text-center mt-5"><Link href="/auth/login" className="text-moss hover:underline">Back to log in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}

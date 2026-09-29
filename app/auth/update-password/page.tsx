"use client";

// Reached from the password-reset email (via /auth/callback, which signs the user in).
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword, friendlyAuthError, useUser } from "@/lib/auth";
import { AuthShell, Field, ErrorNote, inputClass } from "@/components/auth/AuthUI";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Please use at least 8 characters."); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setBusy(true); setError(null);
    const { error } = await updatePassword(password);
    if (error) { setError(friendlyAuthError(error.message)); setBusy(false); return; }
    router.replace("/account");
    router.refresh();
  };

  if (!loading && !user) {
    return (
      <AuthShell eyebrow="Password reset" title="Link expired">
        <p className="text-sm mb-4">This reset link has expired or was already used.</p>
        <Link href="/auth/reset-password" className="btn-primary w-full justify-center flex">Send a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Password reset" title="Choose a new password">
      <form onSubmit={submit} noValidate>
        <ErrorNote message={error} />
        <Field label="New password" hint="At least 8 characters">
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Confirm new password">
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" disabled={busy || loading} className="btn-primary w-full justify-center flex disabled:opacity-50">
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthShell>
  );
}

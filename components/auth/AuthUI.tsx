"use client";

// Shared pieces for the sign-in, sign-up and password pages.
import { useState } from "react";
import { signInWithGoogle, friendlyAuthError } from "@/lib/auth";

export const inputClass =
  "w-full text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss transition-colors";

export function AuthShell({ eyebrow, title, subtitle, children }: {
  eyebrow: string; title: string; subtitle?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-widest text-muted mb-2">{eyebrow}</div>
          <h1 className="font-display font-bold text-3xl tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block mb-4">
      <span className="block text-[11px] uppercase tracking-widest text-muted mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3 py-2 mb-4">{message}</p>;
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 my-5 text-xs text-muted">
      <span className="h-px flex-1 bg-sand" />or<span className="h-px flex-1 bg-sand" />
    </div>
  );
}

export function GoogleButton({ next, label = "Continue with Google" }: { next: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <ErrorNote message={error} />
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true); setError(null);
          const { error } = await signInWithGoogle(next);
          if (error) { setError(friendlyAuthError(error.message)); setBusy(false); }
        }}
        className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
        {busy ? "Opening Google…" : label}
      </button>
    </>
  );
}

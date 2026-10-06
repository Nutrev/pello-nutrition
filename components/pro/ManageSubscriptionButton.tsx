"use client";

// Opens the Stripe customer portal (update card, invoices, cancel). With `addCard`, it opens
// straight at adding a payment method.
import { useState } from "react";

export default function ManageSubscriptionButton({ className = "btn-secondary", label = "Manage subscription", addCard = false }: { className?: string; label?: string; addCard?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addCard ? { flow: "payment_method_update" } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message || "Couldn't open subscription settings. Please try again.");
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" onClick={open} disabled={busy} className={`${className} disabled:opacity-60`}>
        {busy ? "Opening…" : label}
      </button>
      {error && <p role="alert" className="text-xs text-rust mt-2">{error}</p>}
    </>
  );
}

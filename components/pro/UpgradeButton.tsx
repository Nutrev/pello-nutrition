"use client";

// Starts Stripe Checkout. Signed-out visitors are sent to create an account first, then
// back to the pricing page.
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { TRIAL_DAYS } from "@/lib/pro";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

// The prominent full-width call to action on the pricing page.
const PRIMARY =
  "group w-full flex items-center justify-center gap-2 rounded-xl bg-moss text-cream font-display font-semibold text-base " +
  "px-6 py-3.5 shadow-sm hover:bg-ink hover:shadow-md transition-all active:scale-[0.99]";

function Label({ text }: { text: string }) {
  return (
    <>
      {text}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
    </>
  );
}

export default function UpgradeButton({ className = PRIMARY }: { className?: string }) {
  const { user, loading } = useUser();
  const { isPro, hadTrial } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div className={`${className} invisible`}>Loading</div>;
  if (isPro) return <ManageSubscriptionButton className={className} label="You're on Pro · Manage subscription" />;

  const label = hadTrial ? "Upgrade to Pro" : `Start Pro free for ${TRIAL_DAYS} days`;
  if (!user) {
    return <Link href="/auth/login?mode=signup&redirect=%2Fpricing" className={className}><Label text={label} /></Link>;
  }

  const start = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message || "Couldn't start checkout. Please try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={start} disabled={busy} className={`${className} disabled:opacity-60`}>
        {busy ? "Opening secure checkout…" : <Label text={label} />}
      </button>
      {error && <p role="alert" className="text-xs text-rust mt-2 text-center">{error}</p>}
    </>
  );
}

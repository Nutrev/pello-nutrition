"use client";

// After Stripe Checkout sends someone back to /account?upgraded=true. Stripe tells us
// about the new subscription by webhook, usually within seconds, so this waits for it
// before saying Pro is unlocked, then dismisses itself after 5 seconds.
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { PRO_ENABLED } from "@/lib/pro";

export default function UpgradedBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const { refreshProfile } = useUser();
  const { isPro, loading } = useSubscription();
  const upgraded = params.get("upgraded") === "true";
  const [visible, setVisible] = useState(upgraded);
  const [gaveUp, setGaveUp] = useState(false);
  const tries = useRef(0); // survives re-renders, so the 30-second limit holds

  // Wait for the webhook: re-check every 2 seconds for up to 30 seconds.
  useEffect(() => {
    if (!upgraded || loading || isPro) return;
    const timer = setInterval(() => {
      tries.current += 1;
      if (tries.current > 15) { clearInterval(timer); setGaveUp(true); return; }
      refreshProfile();
    }, 2000);
    return () => clearInterval(timer);
  }, [upgraded, loading, isPro, refreshProfile]);

  // Once Pro: refresh the page's server sections, then hide after 5 seconds.
  useEffect(() => {
    if (!upgraded || !isPro) return;
    router.replace("/account", { scroll: false });
    router.refresh();
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [upgraded, isPro, router]);

  if (!PRO_ENABLED || !visible) return null;

  if (isPro) {
    return (
      <div role="status" className="card bg-amber/5 border-amber/30 mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="font-display font-semibold">Welcome to Pello Pro!</div>
          <p className="text-sm text-muted">Your account has been upgraded. All Pro features are now unlocked.</p>
        </div>
        <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss" className="text-muted hover:text-ink text-sm">✕</button>
      </div>
    );
  }
  return (
    <div role="status" className="card mb-6">
      {gaveUp ? (
        <p className="text-sm text-muted">
          Your payment went through, but your upgrade is taking longer than usual to show here. Refresh in a minute; if it
          still isn&apos;t showing, email pellonutrition@gmail.com and we&apos;ll sort it out.
        </p>
      ) : (
        <p className="text-sm text-muted flex items-center gap-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-sand border-t-amber rounded-full" />
          Finishing your upgrade…
        </p>
      )}
    </div>
  );
}

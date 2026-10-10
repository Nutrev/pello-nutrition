"use client";

// The Pello Pro card on the pricing page: monthly/annual toggle (annual only when it's set up),
// the promise, the feature groups from lib/pro.ts, the checkout button and the renewal terms.
import { useEffect, useState } from "react";
import Link from "next/link";
import UpgradeButton from "./UpgradeButton";
import {
  PRO_PRICE_LABEL, PRO_ANNUAL_PRICE_LABEL, PRO_ANNUAL_MONTHLY_LABEL, PRO_ANNUAL_SAVING_LABEL,
  PRO_PROMISE, PRO_FEATURE_GROUPS, TRIAL_DAYS,
} from "@/lib/pro";

function Check() {
  return <span aria-hidden="true" className="text-moss font-semibold w-4 flex-shrink-0">✓</span>;
}

export default function ProPlanCard({ annualEnabled }: { annualEnabled: boolean }) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  // Coming back from sign-up with annual chosen (/pricing?billing=year).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("billing") === "year") setInterval("year");
  }, []);
  const annual = annualEnabled && interval === "year";

  return (
    <div className="card flex flex-col border-2 border-moss relative">
      <span className="absolute -top-3 left-6 text-[10px] uppercase tracking-widest bg-amber text-cream px-2 py-1 rounded-md">
        {TRIAL_DAYS}-day free trial
      </span>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-semibold text-xl">Pello Pro</h2>
        {annualEnabled && (
          <div role="radiogroup" aria-label="Billing" className="inline-flex rounded-lg border border-sand p-0.5 text-xs">
            {(["month", "year"] as const).map((i) => (
              <button key={i} type="button" role="radio" aria-checked={interval === i} onClick={() => setInterval(i)}
                className={`px-3 py-1 rounded-md transition-colors ${interval === i ? "bg-moss text-cream" : "text-muted hover:text-ink"}`}>
                {i === "month" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
        )}
      </div>
      {annual ? (
        <div className="mt-2 mb-1">
          <span className="font-display font-bold text-3xl">{PRO_ANNUAL_PRICE_LABEL}</span> <span className="text-muted text-sm">/ year</span>
          <div className="text-sm text-muted">
            {PRO_ANNUAL_MONTHLY_LABEL}/month, billed annually
            <span className="ml-2 text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">Save {PRO_ANNUAL_SAVING_LABEL}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 mb-1"><span className="font-display font-bold text-3xl">{PRO_PRICE_LABEL}</span> <span className="text-muted text-sm">/ month</span></div>
      )}
      <p className="font-display font-semibold text-ink mt-3 mb-4">{PRO_PROMISE}</p>

      <div className="flex-1 mb-6 space-y-5 text-sm">
        <ul className="space-y-2">
          <li className="flex gap-2"><Check /><span>Everything in Free</span></li>
        </ul>
        {PRO_FEATURE_GROUPS.map((g) => {
          const list = (
            <ul className="space-y-2">
              {g.items.map((f) => <li key={f} className="flex gap-2"><Check /><span>{f}</span></li>)}
            </ul>
          );
          if (!g.heading) return <div key="core">{list}</div>;
          if (g.collapsed) {
            return (
              <details key={g.heading} className="group">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-xs uppercase tracking-widest text-moss mb-2">
                  {g.heading}
                  <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 4.5 6 7.5 9 4.5" />
                  </svg>
                </summary>
                {list}
              </details>
            );
          }
          return (
            <div key={g.heading}>
              <div className="text-xs uppercase tracking-widest text-moss mb-2">{g.heading}</div>
              {list}
            </div>
          );
        })}
      </div>

      <UpgradeButton interval={annual ? "year" : "month"} />
      <p className="text-xs text-muted text-center mt-3 leading-relaxed">
        Cancel anytime.<br />
        {annual
          ? <>New accounts get {TRIAL_DAYS} days free, then {PRO_ANNUAL_PRICE_LABEL}/year (USD) plus any applicable tax. Renews automatically each year until you cancel, which you can do from your account at any time. We&apos;ll email you before each annual renewal.</>
          : <>New accounts get {TRIAL_DAYS} days free, then {PRO_PRICE_LABEL}/month (USD) plus any applicable tax. Renews automatically each month until you cancel, which you can do from your account at any time.</>}
        {" "}See our <Link href="/legal/terms" className="underline">terms</Link>.
      </p>
    </div>
  );
}

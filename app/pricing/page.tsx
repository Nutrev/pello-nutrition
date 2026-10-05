import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRO_ENABLED, PRO_FEATURES, PRO_PRICE_LABEL, TRIAL_DAYS } from "@/lib/pro";
import UpgradeButton from "@/components/pro/UpgradeButton";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pello is free to use. Pello Pro adds unlimited nutrition plans, saved plans, a supplement stack tracker, advanced filters and more.",
  alternates: { canonical: "https://www.pellonutrition.com/pricing" },
};

// Every line here must be true of the site as built. Update it with the features.
const FREE: { text: string; included: boolean }[] = [
  { text: "All product pages and Pello Scores", included: true },
  { text: "Ingredient encyclopedia", included: true },
  { text: "Blog and guides", included: true },
  { text: "Compare 2 products", included: true },
  { text: "Search filters, including diet and quality standards", included: true },
  { text: "Read community reviews", included: true },
  { text: "Save favourite products", included: true },
  { text: "1 event nutrition plan per month", included: true },
  { text: "Save plans", included: false },
  { text: "Advanced filters", included: false },
  { text: "Submit reviews", included: false },
  { text: "Supplement stack tracker", included: false },
  { text: "Plans pre-filled from your athlete profile", included: false },
];

const PRO = ["Everything in Free", ...PRO_FEATURES];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel from your account settings at any time. You keep Pro access until the end of your billing period.",
  },
  {
    q: "Is there a free trial?",
    a: `Yes — ${TRIAL_DAYS} days free, no credit card required upfront. If you haven't added a card by the end of the trial, your account simply goes back to the free plan and you aren't charged. One free trial per account.`,
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards, Apple Pay, Google Pay and Link. Payments are processed by Stripe, and Pello Pro is sold through Link, Stripe's checkout, so your statement will show LINK.COM. Where available, checkout shows the price in your local currency.",
  },
  {
    q: "Do you offer team or coach plans?",
    a: "Coach plans are coming soon. Email us at pellonutrition@gmail.com to join the waitlist.",
  },
];

function Check({ on }: { on: boolean }) {
  return on
    ? <span aria-hidden="true" className="text-moss font-semibold w-4 flex-shrink-0">✓</span>
    : <span aria-hidden="true" className="text-muted/60 w-4 flex-shrink-0">✗</span>;
}

export default function PricingPage() {
  if (!PRO_ENABLED) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="text-center mb-10">
        <div className="text-xs text-muted uppercase tracking-widest mb-2">Pricing</div>
        <h1 className="font-display font-bold text-4xl tracking-tight mb-3">Research free. Go further with Pro.</h1>
        <p className="text-muted max-w-xl mx-auto">
          Every product page, score and ingredient guide is free. Pello Pro is for athletes who want unlimited plans and the tools to act on them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
        {/* Free */}
        <div className="card flex flex-col">
          <h2 className="font-display font-semibold text-xl">Free</h2>
          <div className="mt-2 mb-1"><span className="font-display font-bold text-3xl">$0</span> <span className="text-muted text-sm">/ month</span></div>
          <p className="text-sm text-muted mb-5">Everything you need to research sports nutrition</p>
          <ul className="space-y-2 text-sm mb-6 flex-1">
            {FREE.map((f) => (
              <li key={f.text} className={`flex gap-2 ${f.included ? "" : "text-muted"}`}>
                <Check on={f.included} />
                <span>{f.text}<span className="sr-only">{f.included ? " (included)" : " (not included)"}</span></span>
              </li>
            ))}
          </ul>
          <Link href="/auth/login?mode=signup" className="btn-secondary w-full justify-center flex">Get started free</Link>
        </div>

        {/* Pro */}
        <div className="card flex flex-col border-2 border-moss relative">
          <span className="absolute -top-3 left-6 font-mono text-[10px] uppercase tracking-widest bg-amber text-cream px-2 py-1 rounded-md">
            {TRIAL_DAYS}-day free trial
          </span>
          <h2 className="font-display font-semibold text-xl">Pello Pro</h2>
          <div className="mt-2 mb-1"><span className="font-display font-bold text-3xl">{PRO_PRICE_LABEL}</span> <span className="text-muted text-sm">/ month</span></div>
          <p className="text-sm text-muted mb-5">For serious athletes who want the full picture</p>
          <ul className="space-y-2 text-sm mb-6 flex-1">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2"><Check on /><span>{f}</span></li>
            ))}
          </ul>
          <UpgradeButton />
          <p className="text-xs text-muted text-center mt-3 leading-relaxed">
            Cancel anytime. No commitment.<br />
            New accounts get {TRIAL_DAYS} days free, then {PRO_PRICE_LABEL}/month (USD) plus any applicable tax. Renews automatically each month until you
            cancel, which you can do from your account at any time. See our <Link href="/legal/terms" className="underline">terms</Link>.
          </p>
        </div>
      </div>

      <section aria-label="Frequently asked questions" className="max-w-2xl mx-auto border-t border-sand">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group border-b border-sand">
            <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-medium text-ink hover:text-moss transition-colors">
              {q}
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="h-3.5 w-3.5 flex-shrink-0 text-muted transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
            </summary>
            <p className="text-sm text-muted leading-relaxed pb-5 pr-8 -mt-1">{a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}

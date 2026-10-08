import Link from "next/link";
import { FULENS_SCORE_METHODOLOGY } from "@/lib/fulens-score";
import { SCORE_BANDS } from "@/lib/pello-grade";
import { PillarSwitcher, ScoreScale } from "./MethodologyCards";

// Pillars, weights, principles and score bands all come from the scoring code, so this page
// always matches how products are actually scored.
export default function MethodologyPage() {
  const m = FULENS_SCORE_METHODOLOGY;
  // lastUpdated is a calendar date (YYYY-MM-DD), so format it in UTC to keep the same day.
  const updated = new Date(m.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="text-xs text-muted uppercase tracking-widest mb-2">Methodology</div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
        <h1 className="font-display font-bold text-4xl tracking-tight">Pello Score™</h1>
        <span className="text-xs text-muted border border-sand rounded-full px-2.5 py-0.5">{m.totalPoints}-point scale</span>
        <span className="text-xs text-muted border border-sand rounded-full px-2.5 py-0.5">Version {m.version} · updated {updated}</span>
      </div>
      <p className="text-muted leading-relaxed mb-8 max-w-2xl">
        One question: <strong className="text-ink">how good is this product, really?</strong> Not its marketing, packaging or
        endorsements. Every product is scored with the same published formula, and no brand can pay to change its score.
      </p>

      <div className="space-y-4">
        <PillarSwitcher pillars={m.pillars} />
        <ScoreScale bands={SCORE_BANDS} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-display font-semibold text-base mb-2">Category adjustment</h2>
            <p className="text-sm text-muted leading-relaxed">
              Value is compared within a category: a gel against other gels, never against protein powder. The other pillars use
              one scale for every product, so typical scores differ by category (hydration products tend to score higher than
              probiotics, for example), and scores compare most fairly within one.
            </p>
          </div>
          <div className="card">
            <h2 className="font-display font-semibold text-base mb-2">Principles</h2>
            <ul className="space-y-1.5">
              {m.principles.map((p: string) => (
                <li key={p} className="flex gap-2 text-sm leading-snug">
                  <span aria-hidden="true" className="text-moss font-bold">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/products" className="btn-primary inline-flex">Browse products →</Link>
      </div>
    </div>
  );
}

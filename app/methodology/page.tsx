import Link from "next/link";
import { FULENS_SCORE_METHODOLOGY } from "@/lib/fulens-score";
import { SCORE_BANDS } from "@/lib/pello-grade";
import { PillarSwitcher, ScoreScale } from "./MethodologyCards";
import type { Metadata } from "next";

// Pillars, weights, principles and score bands all come from the scoring code, so this page
// always matches how products are actually scored.
export const metadata: Metadata = {
  title: "How the Pello Score Works",
  description: "How Pello scores sports nutrition products: research support, label transparency, value, athlete reviews and quality, and where the data comes from.",
  alternates: { canonical: "https://www.pellonutrition.com/methodology" },
  openGraph: { title: "How the Pello Score Works | Pello", description: "How Pello scores sports nutrition products: research support, label transparency, value, athlete reviews and quality, and where the data comes from.", url: "https://www.pellonutrition.com/methodology" },
};

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

        <div className="card" id="swaps">
          <h2 className="font-display font-semibold text-base mb-2">How swaps and cost per hour work</h2>
          <p className="text-sm text-muted leading-relaxed mb-2">
            Report pages suggest similar products for gels, chews, bars, carb mixes, protein, hydration and creatine. A swap is
            the same type of product with about the same amount of what it&apos;s bought for (within 25% of the carbs, protein,
            sodium or creatine per serving), and a Pello Score at or above its category&apos;s median. A swap never gives up
            something the product already has: a vegan or sport-tested product is only swapped for another vegan or
            sport-tested one.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-2">
            Each swap says why it&apos;s suggested. Cheaper means at least 10% less per gram of carbs, protein or creatine (per
            serving for hydration). Caffeine-free means no caffeine or other stimulant on the label; products with caffeine in
            some flavors don&apos;t count. Tested for sport means NSF Certified for Sport, Informed Sport or Cologne List.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Cost per hour is what 60g of carbs an hour costs with one product: 60 divided by the carbs per serving, times the
            price per serving. It&apos;s shown for products with at least 15g of carbs per serving. Swaps and costs use
            listed prices and never change a Pello Score.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/products" className="btn-primary inline-flex">Browse products →</Link>
      </div>
    </div>
  );
}

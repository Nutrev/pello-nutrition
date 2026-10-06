// A product in a grid: logo, Pello Score, rating, goals, pack price and buy buttons. Used on
// the home, products, category, brand and account pages. `badge` adds a label above the card
// (e.g. "★ Best Energy Gel").
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import type { ProductSummary } from "@/lib/catalog-types";
import { servingsPerContainer, formatPrice } from "@/lib/servings";
import { getFulensScoreLabel } from "@/lib/pello-grade";
import CardBuyMenu from "@/components/CardBuyMenu";

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
  health: "bg-sage/10 text-sage",
  sleep: "bg-muted/10 text-muted",
  immunity: "bg-moss/10 text-moss",
};

export default function ProductCard({ product, badge }: { product: ProductSummary; badge?: string }) {
  return (
    <div className={`card relative h-full flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all ${badge ? "border-moss/30" : ""}`}>
      {badge && (
        <span className="absolute -top-2 left-3 z-10 bg-moss text-cream text-xs font-medium px-2 py-0.5 rounded-md">{badge}</span>
      )}
      <Link href={`/report/${product.id}`} className="block flex-1 group">
        <div className="flex items-start justify-between mb-3">
          <BrandLogo
             logoDomain={product.logoDomain}
              logo={product.logo}
              brand={product.brand} />
          {product.pelloScore != null ? (
            <PelloScoreTag score={product.pelloScore} />
          ) : (
            <span className="text-xs text-muted">Not yet scored</span>
          )}
        </div>
        <div className="text-xs text-muted font-body mb-0.5">{product.brand}</div>
        <h3 className="font-display font-semibold text-base leading-tight mb-2 group-hover:text-moss transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {product.reviewCount > 0 ? (<>
          <div className="flex text-amber text-sm">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-muted">{product.rating}</span>
          </>) : <span className="text-xs text-muted">No reviews yet</span>}
          <span className="text-xs text-muted">·</span>
          {product.reviewCount > 0 && <span className="text-xs text-muted">{product.reviewCount.toLocaleString()} reviews</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {product.goals.slice(0, 2).map((g) => (
              <span key={g} className={`text-xs px-2 py-0.5 rounded-md ${GOAL_COLORS[g] ?? "bg-sand text-muted"}`}>{g}</span>
            ))}
          </div>
          <span className="text-xs text-muted">{formatPrice(product.price)} · {servingsPerContainer(product)} servings</span>
        </div>
      </Link>
      <div className="mt-4 pt-3 border-t border-sand">
        <CardBuyMenu product={product} />
      </div>
    </div>
  );
}

// The score with its grade (Excellent, Good, Average…) in the grade's color.
export function PelloScoreTag({ score }: { score: number }) {
  const grade = getFulensScoreLabel(score);
  return (
    <div className="flex items-center gap-1.5 text-xs" title={grade.description}>
      <div className="h-2 w-2 rounded-full" style={{ background: grade.color }} />
      <span className="text-muted">Pello Score</span>
      <span className="font-semibold text-ink">{score}</span>
      <span style={{ color: grade.color }}>{grade.label}</span>
    </div>
  );
}

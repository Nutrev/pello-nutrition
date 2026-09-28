// A product in a grid: logo, transparency, rating, goals and pack price. Used on category
// and brand pages. `pelloScore`, when given, is shown in place of the transparency score.
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import type { ProductSummary } from "@/lib/catalog-types";
import { servingsPerContainer, formatPrice } from "@/lib/servings";
import { getFulensScoreLabel } from "@/lib/fulens-score";

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
  health: "bg-sage/10 text-sage",
  sleep: "bg-muted/10 text-muted",
  immunity: "bg-moss/10 text-moss",
};

export default function ProductCard({ product, pelloScore }: { product: ProductSummary; pelloScore?: number }) {
  return (
    <Link href={`/report/${product.id}`}>
      <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
        <div className="flex items-start justify-between mb-3">
          <BrandLogo
             logoDomain={product.logoDomain}
              logo={product.logo}
              brand={product.brand} />
          {pelloScore != null ? (
            <div className="flex items-center gap-1.5" title={`Pello Score: ${getFulensScoreLabel(pelloScore).label}`}>
              <div className="h-2 w-2 rounded-full" style={{ background: getFulensScoreLabel(pelloScore).color }} />
              <span className="text-xs text-muted">Pello Score {pelloScore}</span>
            </div>
          ) : product.transparencyScore != null ? (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: product.transparencyScore! >= 85 ? "#2D4A2D" : product.transparencyScore! >= 70 ? "#C8860A" : "#B84C2E" }} />
              <span className="text-xs text-muted">{product.transparencyScore}% transparent</span>
            </div>
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
      </div>
    </Link>
  );
}

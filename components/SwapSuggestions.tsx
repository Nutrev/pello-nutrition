"use client";

// "Similar products" on a report page: swaps worked out at build time (lib/swaps.ts), each with
// the reasons it's suggested. Falls back to other products in the category when there are none.
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { trackEvent } from "@/components/Analytics";
import type { ProductSummary } from "@/lib/catalog-types";
import { SWAP_LABEL, type Swap } from "@/lib/swaps";
import { formatPrice, servingsPerContainer } from "@/lib/servings";

export interface SwapItem {
  swap: Swap;
  product: ProductSummary;
}

const money = (n: number) => (n < 0.1 ? `${(n * 100).toFixed(1)}¢` : `$${n.toFixed(2)}`);

function costLine(c: NonNullable<Swap["cost"]>): string {
  return `${money(c.swap)} vs ${money(c.own)} per ${c.unit.replace(/^g of /, "gram of ")}`;
}

export default function SwapSuggestions({ productId, swaps, fallback }: { productId: string; swaps: SwapItem[]; fallback: ProductSummary[] }) {
  if (swaps.length > 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 mt-2">
        <h2 className="font-display font-semibold text-base mb-1">Similar products</h2>
        <p className="text-xs text-muted mb-3">
          Same type of product with about the same amount per serving, and a Pello Score at or above the category median.{" "}
          <Link href="/methodology#swaps" className="text-moss hover:underline">How swaps are chosen</Link>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {swaps.map(({ swap, product: p }) => (
            <Link key={p.id} href={`/report/${p.id}`} onClick={() => trackEvent("swap_click", { from: productId, to: p.id, reasons: swap.reasons.join(",") })}>
              <div className="card h-full hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex flex-wrap gap-1 mb-3">
                  {swap.reasons.map((r) => (
                    <span key={r} className="text-[11px] bg-moss/10 text-moss px-2 py-0.5 rounded-full">{SWAP_LABEL[r]}</span>
                  ))}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} />
                  {p.pelloScore != null && <span className="text-xs text-muted">Score {p.pelloScore}</span>}
                </div>
                <div className="text-xs text-muted mb-0.5">{p.brand}</div>
                <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                <div className="text-xs text-muted mt-1">${p.pricePerServing.toFixed(2)} per serving</div>
                {swap.cost && <div className="text-xs text-muted mt-0.5">{costLine(swap.cost)}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  if (fallback.length === 0) return null;
  return (
    <div className="max-w-5xl mx-auto px-6 mt-2">
      <h2 className="font-display font-semibold text-base mb-3">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fallback.map((p) => (
          <Link key={p.id} href={`/report/${p.id}`}>
            <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} />
                <span className="text-xs text-muted">{p.reviewCount > 0 ? `${p.rating} ★` : "No reviews"}</span>
              </div>
              <div className="text-xs text-muted mb-0.5">{p.brand}</div>
              <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
              <div className="text-xs text-muted mt-1">{formatPrice(p.price)} · {servingsPerContainer(p)} servings</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import HomeClient from "./HomeClient";
import { getCatalogStats, getProductSummaries } from "@/lib/catalog";
import { byWeightedRating } from "@/lib/catalog-types";

export default function HomePage() {
  const products = getProductSummaries();

  // Best product per category, by review-weighted rating.
  const best = new Map<string, (typeof products)[number]>();
  for (const p of products) {
    const current = best.get(p.category);
    if (!current || p.weightedRating > current.weightedRating) best.set(p.category, p);
  }

  // Hero cards are picked at random in the browser from the best-rated products.
  const featuredPool = [...products].filter((p) => p.reviewCount > 0).sort(byWeightedRating).slice(0, 40);

  const { productCount, reviewTotal } = getCatalogStats();
  return (
    <HomeClient
      bestPerCategory={Array.from(best.values())}
      featuredPool={featuredPool}
      productCount={productCount}
      reviewTotal={reviewTotal}
    />
  );
}

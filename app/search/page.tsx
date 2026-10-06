import SearchClient from "./SearchClient";
import { getProductSummaries } from "@/lib/catalog";
import { byWeightedRating, type ProductSummary } from "@/lib/catalog-types";

// Products teased below the search box before anyone types: the best-rated product in
// each category, among well-reviewed ones, so the names are ones people recognize.
const TEASER_MIN_REVIEWS = 100;

function teaserProducts(products: ProductSummary[]): ProductSummary[] {
  const best = new Map<string, ProductSummary>();
  for (const p of [...products].filter((p) => p.reviewCount >= TEASER_MIN_REVIEWS).sort(byWeightedRating)) {
    if (!best.has(p.category)) best.set(p.category, p);
  }
  return Array.from(best.values());
}

export default function SearchPage() {
  const catalog = getProductSummaries();
  return <SearchClient catalog={catalog} teaser={teaserProducts(catalog)} />;
}

import SearchClient from "./SearchClient";
import { getProductSummaries } from "@/lib/catalog";
import { byWeightedRating, type ProductSummary } from "@/lib/catalog-types";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Search Sports Nutrition Products",
  description: "Search the sports nutrition products Pello has rated by name, brand, category or ingredient, or ask a question about our product data.",
  alternates: { canonical: "https://www.pellonutrition.com/search" },
  openGraph: { title: "Search Sports Nutrition Products | Pello", description: "Search the sports nutrition products Pello has rated by name, brand, category or ingredient, or ask a question about our product data.", url: "https://www.pellonutrition.com/search" },
};

export default function SearchPage() {
  const catalog = getProductSummaries();
  return <SearchClient catalog={catalog} teaser={teaserProducts(catalog)} />;
}

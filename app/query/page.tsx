import ExploreClient from "./ExploreClient";
import { getProductSummaries } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore the Product Database",
  description: "Filter Pello's sports nutrition database by carbs, sodium, caffeine, price per serving, certifications and Pello Score.",
  alternates: { canonical: "https://www.pellonutrition.com/query" },
  openGraph: { title: "Explore the Product Database | Pello", description: "Filter Pello's sports nutrition database by carbs, sodium, caffeine, price per serving, certifications and Pello Score.", url: "https://www.pellonutrition.com/query" },
};

export default function ExplorePage() {
  return <ExploreClient catalog={getProductSummaries()} />;
}

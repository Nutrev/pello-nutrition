import type { Metadata } from "next";
import { getBrands } from "@/lib/brands";
import BrandsClient from "./BrandsClient";

export const metadata: Metadata = {
  title: "Sports Nutrition Brands",
  description: "Every sports nutrition and supplement brand on Pello, with product counts, average Pello Score™ and price position from independent label analysis.",
  alternates: { canonical: "https://www.pellonutrition.com/brands" },
};

export default function BrandsPage() {
  const brands = getBrands().map((b) => ({
    slug: b.slug, name: b.name, logo: b.logo, logoDomain: b.logoDomain, hq: b.hq,
    pricePosition: b.pricePosition, productCount: b.productCount, avgPelloScore: b.avgPelloScore,
    categories: b.categories,
  }));
  return <BrandsClient brands={brands} />;
}

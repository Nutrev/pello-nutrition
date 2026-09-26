import type { Metadata } from "next";
import { getCatalogStats } from "@/lib/catalog";

const { productCount } = getCatalogStats();

export const metadata: Metadata = {
  title: "All Sports Nutrition Products",
  description: `Browse ${productCount} sports nutrition products — energy gels, drink mixes, protein, creatine and supplements. Science-backed reviews and Pello Score™ ratings for endurance athletes.`,
  openGraph: {
    title: "All Sports Nutrition Products | Pello",
    description: `Browse ${productCount} sports nutrition products with science-backed reviews and Pello Score™ ratings.`,
    url: "https://www.pellonutrition.com/products",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
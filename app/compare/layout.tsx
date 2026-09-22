import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Sports Nutrition Products",
  description: "Compare up to 3 sports nutrition products side by side. Ingredients, sentiment scores, Pello Score™ and value analysis for energy gels, drink mixes and supplements.",
  openGraph: {
    title: "Compare Sports Nutrition Products | Pello",
    description: "Side-by-side comparison of sports nutrition products with ingredient analysis and Pello Score™.",
    url: "https://www.pellonutrition.com/compare",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
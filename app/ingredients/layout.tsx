import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Nutrition Ingredient Encyclopedia",
  description: "Science-backed reference for 25+ sports nutrition ingredients. Evidence ratings, optimal doses, preferred forms and flag alerts for seed oils, artificial sweeteners and preservatives.",
  openGraph: {
    title: "Sports Nutrition Ingredient Encyclopedia | Pello",
    description: "Evidence ratings, optimal doses and flag alerts for sports nutrition ingredients.",
    url: "https://www.pellonutrition.com/ingredients",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
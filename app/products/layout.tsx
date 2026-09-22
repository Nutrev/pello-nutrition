import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Sports Nutrition Products",
  description: "Browse 120+ sports nutrition products — energy gels, drink mixes, protein, creatine and supplements. Science-backed reviews and Pello Score™ ratings for endurance athletes.",
  openGraph: {
    title: "All Sports Nutrition Products | Pello",
    description: "Browse 120+ sports nutrition products with science-backed reviews and Pello Score™ ratings.",
    url: "https://www.pellonutrition.com/products",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
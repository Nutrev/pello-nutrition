import { notFound } from "next/navigation";
import ReportClient from "./ReportClient";
import { getProduct, getProductSummaries } from "@/lib/catalog";
import { byWeightedRating } from "@/lib/catalog-types";
import { getBrandByName } from "@/lib/brands";

// Every product page is pre-built at deploy time.
export function generateStaticParams() {
  return getProductSummaries().map((p) => ({ id: p.id }));
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  const all = getProductSummaries();
  const similar = all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort(byWeightedRating)
    .slice(0, 3);
  const directory = all.map(({ id, name, brand, logo, logoDomain }) => ({ id, name, brand, logo, logoDomain }));

  const b = getBrandByName(product.brand)!;
  const brand = {
    slug: b.slug, name: b.name, founded: b.founded, hq: b.hq, pricePosition: b.pricePosition, productCount: b.productCount,
    line: b.description.split(/(?<=\.)\s/)[0],
  };

  // Keyed by product so moving between products starts fresh (summary, selected size…).
  return <ReportClient key={product.id} product={product} similar={similar} directory={directory} brand={brand} />;
}

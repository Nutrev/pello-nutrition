import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import { getProductSummaries } from "@/lib/catalog";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsClient catalog={getProductSummaries()} />
    </Suspense>
  );
}

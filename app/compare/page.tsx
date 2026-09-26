import { Suspense } from "react";
import CompareClient from "./CompareClient";
import { getProductSummaries } from "@/lib/catalog";

export default function ComparePage() {
  return (
    <Suspense>
      <CompareClient catalog={getProductSummaries()} />
    </Suspense>
  );
}

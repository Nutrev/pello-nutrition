import ExploreClient from "./ExploreClient";
import { getProductSummaries } from "@/lib/catalog";

export default function ExplorePage() {
  return <ExploreClient catalog={getProductSummaries()} />;
}

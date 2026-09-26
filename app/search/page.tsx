import SearchClient from "./SearchClient";
import { getProductSummaries } from "@/lib/catalog";

export default function SearchPage() {
  return <SearchClient catalog={getProductSummaries()} />;
}

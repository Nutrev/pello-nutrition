import PlannerClient from "./PlannerClient";
import { getProductSummaries } from "@/lib/catalog";

export default function PlannerPage() {
  return <PlannerClient catalog={getProductSummaries()} />;
}

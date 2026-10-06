import PlannerClient from "./PlannerClient";
import { getProductSummaries } from "@/lib/catalog";
import { PLANNER_MODES, type PlannerMode } from "@/lib/planner-modes";

// /quiz?mode=<id> opens a planner directly (e.g. from the account page); otherwise the
// mode chooser shows first.
export default function PlannerPage({ searchParams }: { searchParams: { mode?: string } }) {
  const mode = PLANNER_MODES.find((m) => m.id === searchParams.mode)?.id as PlannerMode | undefined;
  return <PlannerClient catalog={getProductSummaries()} initialMode={mode ?? null} />;
}

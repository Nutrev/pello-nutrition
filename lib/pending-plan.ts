// lib/pending-plan.ts
// A plan built while signed out is kept in this tab's sessionStorage, so it can be
// saved once the athlete has signed up or signed in (see PendingPlanBanner).
import type { PlannerInputs } from "./planner";
import type { PlanContent } from "./account-types";

const KEY = "pello_pending_plan";

export interface PendingPlan {
  name: string;
  inputs: PlannerInputs;
  plan_content: PlanContent;
}

export function stashPendingPlan(plan: PendingPlan) {
  try { sessionStorage.setItem(KEY, JSON.stringify(plan)); } catch {}
}

export function readPendingPlan(): PendingPlan | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingPlan) : null;
  } catch { return null; }
}

export function clearPendingPlan() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

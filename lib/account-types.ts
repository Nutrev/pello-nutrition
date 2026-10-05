// lib/account-types.ts
// Rows in the account tables (supabase/accounts.sql).
import type { PlannerInputs } from "./planner";

export interface UserProfile {
  id: string;
  created_at: string;
  username: string | null;
  weight_kg: number | null;
  weight_unit: "kg" | "lbs";
  age: number | null;
  sex: "male" | "female" | null;
  training_days_per_week: number | null;
  ftp_watts?: number | null;     // cycling FTP, for reading power-based workout files
  threshold_pace_sec_per_km?: number | null;  // running threshold pace, for run workout files
  threshold_hr?: number | null;  // running threshold heart rate (bpm)
  caffeine_preference: "none" | "moderate" | "high" | null;
  dietary: string[];
  goals: string[];
}

// The parsed plan sections, as shown on the planner results page.
export interface PlanContent {
  preEvent: string[];
  duringEvent: string[];
  postEvent: string[];
  totals: string[];
  keyNotes: string[];
}

// Saved content of a supplement stack, race week or budget optimiser plan: text sections, and
// groups of products by id (shown from the current catalogue, so prices stay current).
export interface ModePlanContent {
  kind: "sections";
  sections: { title: string; lines: string[] }[];
  productGroups: { title: string; note?: string; productIds: string[] }[];
}

export type SavedPlanMode = "event" | "outcome" | "supplement-stack" | "race-week" | "budget-optimiser";

export interface SavedPlan {
  id: string;
  user_id: string;
  created_at: string;
  plan_name: string;
  plan_mode: SavedPlanMode;
  // Event and outcome plans store PlannerInputs; the other modes store their own inputs.
  inputs: PlannerInputs;
  plan_content: PlanContent | ModePlanContent;
  notes: string | null;
}

export const SAVED_PLAN_LABEL: Record<SavedPlanMode, string> = {
  event: "Event", outcome: "Goal", "supplement-stack": "Supplement stack", "race-week": "Race week", "budget-optimiser": "Budget",
};
export const isModeContent = (c: PlanContent | ModePlanContent): c is ModePlanContent => (c as ModePlanContent)?.kind === "sections";

export interface FavouriteProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  notes: string | null;
}

export interface StackItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  daily_dose: string | null;
  timing: string | null;
  notes: string | null;
  is_active: boolean;
}

export const GOAL_OPTIONS: { id: string; label: string }[] = [
  { id: "endurance", label: "Endurance performance" },
  { id: "race-faster", label: "Race faster" },
  { id: "muscle", label: "Build muscle and strength" },
  { id: "recovery", label: "Recover faster" },
  { id: "body-composition", label: "Body composition" },
  { id: "gut-health", label: "Gut comfort during exercise" },
  { id: "sleep", label: "Sleep better" },
  { id: "immunity", label: "Stay healthy in heavy training" },
  { id: "general-health", label: "General health" },
];

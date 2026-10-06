"use client";

// Calls /api/plan for the supplement stack, race week and budget optimizer planners.
import { useState } from "react";

export interface PlanResponse { plan: string; products: { id: string; name: string; brand: string }[] }

export function usePlanRequest(planner: "supplement-stack" | "race-week" | "budget-optimiser") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [result, setResult] = useState<PlanResponse | null>(null);

  const run = async (inputs: unknown) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planner, inputs }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError({ message: data.error ?? "Couldn't build the plan. Please try again.", code: data.code });
      else setResult({ plan: data.plan ?? "", products: data.products ?? [] });
    } catch {
      setError({ message: "Couldn't build the plan. Check your connection and try again." });
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setError(null); };
  return { run, loading, error, result, reset };
}

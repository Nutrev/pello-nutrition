"use client";

// Offers to save a plan the athlete built before signing in.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import { readPendingPlan, clearPendingPlan, type PendingPlan } from "@/lib/pending-plan";

export default function PendingPlanBanner() {
  const router = useRouter();
  const [plan, setPlan] = useState<PendingPlan | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = readPendingPlan();
    if (p) { setPlan(p); setName(p.name); }
  }, []);

  if (!plan) return null;

  const save = async () => {
    setBusy(true); setError(null);
    const supabase = await loadBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("saved_plans").insert({
      user_id: user?.id, plan_name: name.trim() || plan.name, plan_mode: plan.inputs.mode,
      inputs: plan.inputs, plan_content: plan.plan_content,
    });
    if (error) { setError("Couldn't save the plan. Please try again."); setBusy(false); return; }
    clearPendingPlan();
    setPlan(null);
    router.refresh();
  };

  return (
    <div className="card bg-moss/5 border-moss/20 mb-6">
      <div className="font-display font-semibold mb-1">Save the plan you just built?</div>
      <p className="text-sm text-muted mb-3">You built a plan before signing in. Save it to your account to keep it.</p>
      {error && <p className="text-sm text-rust mb-2">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} aria-label="Plan name"
          className="flex-1 text-sm bg-white/60 border border-sand rounded-lg px-3 py-2 focus:outline-none focus:border-moss" />
        <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-50">{busy ? "Saving…" : "Save plan"}</button>
        <button type="button" onClick={() => { clearPendingPlan(); setPlan(null); }} className="btn-secondary">Dismiss</button>
      </div>
    </div>
  );
}

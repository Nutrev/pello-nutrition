"use client";

// "Save this plan" on the planner results. Signed out: the plan is kept in this tab
// and the sign-up prompt opens; it can be saved from the account page afterwards.
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import { stashPendingPlan } from "@/lib/pending-plan";
import type { PlannerInputs } from "@/lib/planner";
import type { PlanContent } from "@/lib/account-types";
import Modal from "@/components/Modal";
import AuthPrompt from "./AuthPrompt";

export default function SavePlanButton({ inputs, planContent, defaultName }: {
  inputs: PlannerInputs; planContent: PlanContent; defaultName: string;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const click = () => {
    if (!user) {
      stashPendingPlan({ name: defaultName, inputs, plan_content: planContent });
      setPrompt(true);
      return;
    }
    setName(defaultName); setError(null); setOpen(true);
  };

  const save = async () => {
    setBusy(true); setError(null);
    const { data, error } = await (await loadBrowserSupabase()).from("saved_plans").insert({
      user_id: user!.id, plan_name: name.trim() || defaultName, plan_mode: inputs.mode, inputs, plan_content: planContent,
    }).select("id").single();
    setBusy(false);
    if (error) { setError("Couldn't save the plan. Please try again."); return; }
    setSavedId(data.id);
    setOpen(false);
  };

  if (savedId) {
    return (
      <div className="card bg-moss/5 border-moss/20 flex items-center justify-between gap-3 mb-3">
        <span className="text-sm text-moss font-medium">✓ Plan saved to your account</span>
        <Link href={`/account/plans/${savedId}`} className="text-sm text-moss hover:underline whitespace-nowrap">View plan →</Link>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={click} className="btn-primary w-full justify-center flex mb-3">Save this plan</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Save this plan">
        <label className="block mb-4">
          <span className="block text-[11px] uppercase tracking-widest text-muted mb-1">Plan name</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
            className="w-full text-sm bg-white/60 border border-sand rounded-lg px-3 py-2.5 focus:outline-none focus:border-moss" />
        </label>
        {error && <p role="alert" className="text-sm text-rust mb-3">{error}</p>}
        <button type="button" onClick={save} disabled={busy} className="btn-primary w-full justify-center flex disabled:opacity-50">
          {busy ? "Saving…" : "Save plan"}
        </button>
      </Modal>
      <AuthPrompt open={prompt} onClose={() => setPrompt(false)} action="save this plan" returnTo="/account" />
    </>
  );
}

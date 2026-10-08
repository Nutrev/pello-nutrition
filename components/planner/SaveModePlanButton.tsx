"use client";

// "Save this plan" for the supplement stack, race week and budget optimizer planners. Saving is
// Pello Pro once Pro is on (the database enforces it too); signed-out visitors are asked to log in.
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { useProAccess } from "@/lib/subscription";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import type { ModePlanContent, SavedPlanMode } from "@/lib/account-types";
import Modal from "@/components/Modal";
import ProGate from "@/components/ProGate";
import AuthPrompt from "@/components/account/AuthPrompt";

export default function SaveModePlanButton({ mode, inputs, content, defaultName }: {
  mode: Exclude<SavedPlanMode, "event" | "outcome">;
  inputs: unknown;
  content: ModePlanContent;
  defaultName: string;
}) {
  const { user } = useUser();
  const { allowed } = useProAccess();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  if (savedId) {
    return (
      <div className="card bg-moss/5 border-moss/20 flex items-center justify-between gap-3 mb-3">
        <span className="text-sm text-moss font-medium">Plan saved to your account</span>
        <Link href={`/account/plans/${savedId}`} className="text-sm text-moss hover:underline whitespace-nowrap">View plan</Link>
      </div>
    );
  }

  if (user && !allowed) {
    return <div className="mb-3"><ProGate compact feature="Save and revisit plans" description="Keep this plan in your account and come back to it any time." /></div>;
  }

  const save = async () => {
    setBusy(true); setError(null);
    const { data, error } = await (await loadBrowserSupabase()).from("saved_plans").insert({
      user_id: user!.id, plan_name: name.trim().slice(0, 100) || defaultName, plan_mode: mode, inputs, plan_content: content,
    }).select("id").single();
    setBusy(false);
    if (error) { setError("Couldn't save the plan. Please try again."); return; }
    setSavedId(data.id);
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => (user ? (setName(defaultName), setError(null), setOpen(true)) : setPrompt(true))}
        className="btn-primary w-full justify-center flex mb-3">Save this plan</button>
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
      <AuthPrompt open={prompt} onClose={() => setPrompt(false)} action="save this plan" returnTo="/quiz" />
    </>
  );
}

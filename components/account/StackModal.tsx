"use client";

// Add a product to the signed-in user's supplement stack, or edit an existing stack item.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import type { StackItem } from "@/lib/account-types";

const TIMINGS = ["Morning", "With breakfast", "Pre-workout", "During exercise", "Post-workout", "With dinner", "Before bed"];
const input = "w-full text-sm bg-white/60 border border-sand rounded-lg px-3 py-2 focus:outline-none focus:border-moss";

export default function StackModal({ open, onClose, productId, productName, defaultDose, existing, onSaved }: {
  open: boolean; onClose: () => void; productId: string; productName: string;
  defaultDose?: string; existing?: StackItem; onSaved?: () => void;
}) {
  const router = useRouter();
  const [dose, setDose] = useState("");
  const [timing, setTiming] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDose(existing?.daily_dose ?? defaultDose ?? "");
    setTiming(existing?.timing ?? "");
    setNotes(existing?.notes ?? "");
    setError(null);
  }, [open, existing, defaultDose]);

  const save = async () => {
    setBusy(true); setError(null);
    const supabase = await loadBrowserSupabase();
    const fields = { daily_dose: dose.trim() || null, timing: timing.trim() || null, notes: notes.trim() || null };
    let error;
    if (existing) {
      ({ error } = await supabase.from("supplement_stack").update(fields).eq("id", existing.id));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      ({ error } = await supabase.from("supplement_stack").insert({ user_id: user?.id, product_id: productId, is_active: true, ...fields }));
    }
    setBusy(false);
    if (error) { setError("Couldn't save. Please try again."); return; }
    onSaved?.();
    onClose();
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose} title={existing ? "Edit stack item" : "Add to my stack"}>
      <p className="text-sm text-muted mb-4">{productName}</p>
      <label className="block mb-3">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1">Daily dose</span>
        <input value={dose} onChange={(e) => setDose(e.target.value)} maxLength={200} placeholder="e.g. 1 scoop, 2 capsules" className={input} />
      </label>
      <label className="block mb-3">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1">When you take it</span>
        <input value={timing} onChange={(e) => setTiming(e.target.value)} maxLength={200} list="stack-timings" placeholder="e.g. Before bed" className={input} />
        <datalist id="stack-timings">{TIMINGS.map((t) => <option key={t} value={t} />)}</datalist>
      </label>
      <label className="block mb-4">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={3} className={input} />
      </label>
      {error && <p role="alert" className="text-sm text-rust mb-3">{error}</p>}
      <button type="button" onClick={save} disabled={busy} className="btn-primary w-full justify-center flex disabled:opacity-50">
        {busy ? "Saving…" : existing ? "Save changes" : "Add to stack"}
      </button>
    </Modal>
  );
}

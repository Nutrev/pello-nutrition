import type { Metadata } from "next";
import Link from "next/link";
import { requireAccountUser } from "@/lib/account-server";
import { formatDate } from "@/lib/format-date";
import { EVENT_TYPES, OUTCOME_TYPES } from "@/lib/planner";
import type { SavedPlan } from "@/lib/account-types";
import DeleteRowButton from "@/components/account/DeleteRowButton";

export const metadata: Metadata = { title: "Saved plans", robots: { index: false } };

export default async function PlansPage() {
  const { supabase } = await requireAccountUser("/account/plans");
  const { data } = await supabase.from("saved_plans").select("id, plan_name, plan_mode, inputs, created_at").order("created_at", { ascending: false });
  const plans = (data ?? []) as Pick<SavedPlan, "id" | "plan_name" | "plan_mode" | "inputs" | "created_at">[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/account" className="text-xs text-muted hover:text-ink">← Account</Link>
      <div className="flex items-end justify-between gap-4 mt-3 mb-6">
        <h1 className="font-display font-bold text-3xl tracking-tight">Saved plans</h1>
        <Link href="/quiz" className="btn-primary whitespace-nowrap">Build new plan</Link>
      </div>
      {plans.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-muted mb-4">You haven&apos;t saved any plans yet. Build one with the Pello Planner and tap &ldquo;Save this plan&rdquo;.</p>
          <Link href="/quiz" className="btn-primary inline-flex">Build a plan</Link>
        </div>
      ) : (
        <div className="card divide-y divide-sand p-0">
          {plans.map((p) => {
            const type = p.plan_mode === "event"
              ? EVENT_TYPES.find((e) => e.id === p.inputs?.eventType)?.label
              : OUTCOME_TYPES.find((o) => o.id === p.inputs?.outcomeType)?.label;
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <Link href={`/account/plans/${p.id}`} className="min-w-0 flex-1 group">
                  <div className="font-medium text-sm truncate group-hover:text-moss">{p.plan_name}</div>
                  <div className="text-xs text-muted">
                    {formatDate(p.created_at)} · {p.plan_mode === "event" ? "Event" : "Goal"}{type ? ` · ${type}` : ""}
                  </div>
                </Link>
                <DeleteRowButton table="saved_plans" id={p.id} label="Delete" confirmText={`Delete "${p.plan_name}"? This can't be undone.`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

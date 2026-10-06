import type { Metadata } from "next";
import Link from "next/link";
import { requireAccountUser, accountAccess } from "@/lib/account-server";
import ReadOnlyNote from "@/components/pro/ReadOnlyNote";
import { formatDate } from "@/lib/format-date";
import { EVENT_TYPES, OUTCOME_TYPES, WORKOUT_TYPES } from "@/lib/planner";
import { SAVED_PLAN_LABEL, type SavedPlan } from "@/lib/account-types";
import DeleteRowButton from "@/components/account/DeleteRowButton";

export const metadata: Metadata = { title: "Saved plans", robots: { index: false } };

export default async function PlansPage() {
  const { supabase, user } = await requireAccountUser("/account/plans");
  const [{ data }, access] = await Promise.all([
    supabase.from("saved_plans").select("id, plan_name, plan_mode, inputs, created_at").order("created_at", { ascending: false }),
    accountAccess(supabase, user.id),
  ]);
  const plans = (data ?? []) as Pick<SavedPlan, "id" | "plan_name" | "plan_mode" | "inputs" | "created_at">[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/account" className="text-xs text-muted hover:text-ink">← Account</Link>
      <div className="flex items-end justify-between gap-4 mt-3 mb-6">
        <h1 className="font-display font-bold text-3xl tracking-tight">Saved plans</h1>
        <Link href="/quiz" className="btn-primary whitespace-nowrap">Build new plan</Link>
      </div>
      {!access.allowed && (
        <ReadOnlyNote feature="Save and revisit plans"
          text={plans.length > 0
            ? "You can still open and delete the plans you've saved. Saving new plans needs Pello Pro."
            : "Keep every plan you build, revisit it any time and export it as a PDF with Pello Pro."} />
      )}
      {plans.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-muted mb-4">You haven&apos;t saved any plans yet.{access.allowed ? <> Build one with the Pello Planner and tap &ldquo;Save this plan&rdquo;.</> : null}</p>
          <Link href="/quiz" className="btn-primary inline-flex">Build a plan</Link>
        </div>
      ) : (
        <div className="card divide-y divide-sand p-0">
          {plans.map((p) => {
            const type = p.plan_mode === "workout"
              ? WORKOUT_TYPES.find((w) => w.id === p.inputs?.eventType)?.label
              : p.plan_mode === "event"
              ? EVENT_TYPES.find((e) => e.id === p.inputs?.eventType)?.label
              : p.plan_mode === "outcome" ? OUTCOME_TYPES.find((o) => o.id === p.inputs?.outcomeType)?.label : null;
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <Link href={`/account/plans/${p.id}`} className="min-w-0 flex-1 group">
                  <div className="font-medium text-sm truncate group-hover:text-moss">{p.plan_name}</div>
                  <div className="text-xs text-muted">
                    {formatDate(p.created_at)} · {SAVED_PLAN_LABEL[p.plan_mode] ?? "Plan"}{type ? ` · ${type}` : ""}
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

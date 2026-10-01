import Link from "next/link";
import LockIcon from "./LockIcon";

// Shown on account pages that are read-only on the free plan.
export default function ReadOnlyNote({ feature, text }: { feature: string; text: string }) {
  return (
    <div className="card bg-amber/5 border-amber/30 flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber/10 text-amber flex-shrink-0"><LockIcon /></span>
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-amber">Pello Pro · {feature}</div>
        <p className="text-sm text-muted mt-0.5">{text}</p>
      </div>
      <Link href="/pricing" className="btn-primary text-sm whitespace-nowrap">Upgrade to Pro</Link>
    </div>
  );
}

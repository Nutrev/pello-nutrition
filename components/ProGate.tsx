"use client";

// Wraps a Pello Pro feature. Pro users (and everyone, while Pro is switched off) see the
// feature itself. Everyone else sees a faded preview with a short note on what Pro adds.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProAccess } from "@/lib/subscription";
import LockIcon from "@/components/pro/LockIcon";

export default function ProGate({ feature, description, children, fallback, compact = false }: {
  feature: string;            // e.g. "Advanced filters"
  description?: string;       // one line on what it does for them
  children?: React.ReactNode; // the feature; also shown faded behind the note
  fallback?: React.ReactNode; // replaces the default note
  compact?: boolean;          // a slimmer note for small spaces
}) {
  const { allowed, signedIn, loading } = useProAccess();
  const path = usePathname();

  if (allowed) return <>{children}</>;
  if (loading) return <div aria-hidden="true" className="invisible">{children}</div>;

  const note = fallback ?? (
    <div className={`bg-cream border border-amber/30 rounded-xl shadow-sm text-center ${compact ? "p-4" : "p-5"} max-w-sm w-full`}>
      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber/10 text-amber mb-2">
        <LockIcon />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-amber mb-1">Pello Pro feature</div>
      <div className="font-display font-semibold text-ink">{feature}</div>
      {description && <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>}
      <div className="flex flex-col items-center gap-1.5 mt-3">
        <Link href="/pricing" className="btn-primary text-xs py-2 px-4">Upgrade to Pro</Link>
        {!signedIn && (
          <Link href={`/auth/login?redirect=${encodeURIComponent(path)}`} className="text-xs text-muted hover:text-ink">
            Already Pro? Log in
          </Link>
        )}
      </div>
    </div>
  );

  if (!children) return <div className="flex justify-center">{note}</div>;

  return (
    <div className="relative">
      <div aria-hidden="true" ref={(el) => el?.setAttribute("inert", "")} className="pointer-events-none select-none opacity-40 blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-3">{note}</div>
    </div>
  );
}

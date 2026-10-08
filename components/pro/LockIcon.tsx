export default function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

// Small "Pro" tag for locked options.
export function ProTag() {
  return <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber/10 text-amber px-1.5 py-0.5 rounded">Pro</span>;
}

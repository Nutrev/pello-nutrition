// A small warning triangle, drawn rather than the ⚠ character, which many devices show as an emoji.
export default function WarningIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3 2.5 16.5h15L10 3Z" />
      <path d="M10 8.5v3.5M10 14.3v.2" />
    </svg>
  );
}

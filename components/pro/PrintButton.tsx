"use client";

// "Export as PDF": opens the browser's print dialog, where "Save as PDF" is an option.
// The print styles in globals.css hide the nav, footer and buttons.
export default function PrintButton({ label = "Export as PDF", className = "btn-secondary" }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {label}
    </button>
  );
}

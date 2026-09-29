"use client";

// Accessible dialog: closes on Escape or a click on the backdrop, and returns focus.
import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative card w-full max-w-md max-h-[90vh] overflow-y-auto outline-none">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display font-semibold text-lg">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink -mr-1 -mt-1 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-sand/50">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

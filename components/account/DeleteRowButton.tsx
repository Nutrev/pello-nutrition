"use client";

// Deletes one of the user's rows (row-level security limits it to their own), after a confirm.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadBrowserSupabase } from "@/lib/supabase/load";

export default function DeleteRowButton({ table, id, label, confirmText, redirectTo, className }: {
  table: "saved_plans" | "favourite_products" | "supplement_stack";
  id: string; label: string; confirmText: string; redirectTo?: string; className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-rust">Couldn&apos;t remove. Try again.</span>}
      <button type="button" disabled={busy}
        className={className ?? "text-xs text-muted hover:text-rust transition-colors disabled:opacity-50"}
        onClick={async () => {
          if (!window.confirm(confirmText)) return;
          setBusy(true); setError(false);
          const { error } = await (await loadBrowserSupabase()).from(table).delete().eq("id", id);
          if (error) { setError(true); setBusy(false); return; }
          if (redirectTo) router.replace(redirectTo);
          router.refresh();
        }}>
        {busy ? "Removing…" : label}
      </button>
    </span>
  );
}

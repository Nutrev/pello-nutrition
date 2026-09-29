"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadBrowserSupabase } from "@/lib/supabase/load";
import type { StackItem } from "@/lib/account-types";
import StackModal from "./StackModal";
import DeleteRowButton from "./DeleteRowButton";

export default function StackItemControls({ item, productName }: { item: StackItem; productName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <button type="button" role="switch" aria-checked={item.is_active} aria-label={`${productName}: ${item.is_active ? "active" : "paused"}`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await (await loadBrowserSupabase()).from("supplement_stack").update({ is_active: !item.is_active }).eq("id", item.id);
          setBusy(false);
          router.refresh();
        }}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${item.is_active ? "bg-moss" : "bg-sand"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.is_active ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <button type="button" onClick={() => setEditing(true)} className="text-xs text-muted hover:text-ink">Edit</button>
      <DeleteRowButton table="supplement_stack" id={item.id} label="Remove" confirmText={`Remove ${productName} from your stack?`} />
      <StackModal open={editing} onClose={() => setEditing(false)} productId={item.product_id} productName={productName} existing={item} />
    </div>
  );
}

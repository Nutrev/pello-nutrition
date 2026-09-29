"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} className="btn-secondary text-sm disabled:opacity-50"
      onClick={async () => { setBusy(true); await signOut(); router.replace("/"); router.refresh(); }}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

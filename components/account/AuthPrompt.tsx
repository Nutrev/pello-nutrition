"use client";

// Shown when a signed-out visitor tries to save something.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";
import { PRO_ENABLED } from "@/lib/pro";

// `returnTo` is where to land after signing in or up (defaults to the current page).
export default function AuthPrompt({ open, onClose, action, returnTo }: { open: boolean; onClose: () => void; action: string; returnTo?: string }) {
  const path = usePathname();
  const redirect = encodeURIComponent(returnTo ?? path);
  return (
    <Modal open={open} onClose={onClose} title={PRO_ENABLED ? `Log in or create an account to ${action}` : `Create a free account to ${action}`}>
      <p className="text-sm text-muted mb-5">
        {PRO_ENABLED
          ? <>A free Pello account lets you keep favourite products and build a nutrition plan each month. Saving plans and tracking your supplement stack are part of Pello Pro.</>
          : <>A Pello account lets you save nutrition plans, keep favourite products and track your supplement stack. It&apos;s free.</>}
      </p>
      <div className="flex flex-col gap-2">
        <Link href={`/auth/login?mode=signup&redirect=${redirect}`} className="btn-primary justify-center flex">Create a free account</Link>
        <Link href={`/auth/login?redirect=${redirect}`} className="btn-secondary justify-center flex">Log in</Link>
      </div>
    </Modal>
  );
}

"use client";

// Shown when a signed-out visitor tries to save something.
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";

// `returnTo` is where to land after signing in or up (defaults to the current page).
export default function AuthPrompt({ open, onClose, action, returnTo }: { open: boolean; onClose: () => void; action: string; returnTo?: string }) {
  const path = usePathname();
  const redirect = encodeURIComponent(returnTo ?? path);
  return (
    <Modal open={open} onClose={onClose} title={`Create a free account to ${action}`}>
      <p className="text-sm text-muted mb-5">
        A Pello account lets you save nutrition plans, keep favourite products and track your supplement stack. It&apos;s free.
      </p>
      <div className="flex flex-col gap-2">
        <Link href={`/auth/signup?redirect=${redirect}`} className="btn-primary justify-center flex">Sign up free</Link>
        <Link href={`/auth/login?redirect=${redirect}`} className="btn-secondary justify-center flex">I already have an account</Link>
      </div>
    </Modal>
  );
}

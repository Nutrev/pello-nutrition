"use client";

// A small dialog for a Pello Pro feature someone tried to use.
import Link from "next/link";
import Modal from "@/components/Modal";
import LockIcon from "./LockIcon";
import { INDEPENDENCE_SHORT } from "@/lib/pro";

export default function UpgradePrompt({ open, onClose, feature, description }: {
  open: boolean; onClose: () => void; feature: string; description: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`${feature} is a Pello Pro feature`}>
      <div className="flex items-start gap-3 mb-5">
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber/10 text-amber flex-shrink-0"><LockIcon /></span>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="/pricing" className="btn-primary justify-center flex">See Pello Pro</Link>
        <button type="button" onClick={onClose} className="btn-secondary justify-center flex">Not now</button>
      </div>
      <p className="text-[11px] text-muted text-center mt-3">{INDEPENDENCE_SHORT}</p>
    </Modal>
  );
}

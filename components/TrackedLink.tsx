"use client";

// A link that records an analytics event when clicked (only with the visitor's consent; see
// components/Analytics.tsx). For use in server-rendered pages.
import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/components/Analytics";

export default function TrackedLink({ href, event, params, external, className, children }: {
  href: string;
  event: AnalyticsEvent;
  params?: Record<string, string>;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const onClick = () => trackEvent(event, { href, ...params });
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>{children}</a>
  ) : (
    <Link href={href} onClick={onClick} className={className}>{children}</Link>
  );
}

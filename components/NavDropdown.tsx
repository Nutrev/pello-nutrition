"use client";

import Link from "next/link";
import { useId } from "react";

export type NavItem = { href: string; label: string };

interface NavDropdownProps {
  label: string;
  items: NavItem[];
  open: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
}

// A click-to-open menu in the desktop nav. Open state lives in SiteNav, so only one
// menu is open at a time and a single listener handles outside clicks and Escape.
export default function NavDropdown({ label, items, open, onToggle, isActive }: NavDropdownProps) {
  const menuId = useId();
  const containsActive = items.some((item) => isActive(item.href));

  return (
    <div className="relative" data-nav-menu>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={menuId}
        className={`text-sm transition-colors flex items-center gap-1 ${containsActive || open ? "text-ink" : "text-muted hover:text-ink"} ${containsActive ? "font-medium" : ""}`}
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute left-0 top-full mt-2 bg-cream border border-sand rounded-xl shadow-md py-2 min-w-[160px]"
        >
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`block px-4 py-2 text-sm hover:text-ink hover:bg-sand/50 transition-colors ${isActive(href) ? "text-ink font-medium" : "text-muted"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

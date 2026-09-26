"use client";

import Link from "next/link";
import { useId } from "react";

// `exact` marks a link that is only current on its own page, not on pages below it
// (so "All products" isn't highlighted on every category page).
export type NavItem = { href: string; label: string; count?: number; exact?: boolean };
export type NavSection = { label?: string; items: NavItem[] };

export function isItemActive(pathname: string, { href, exact }: NavItem): boolean {
  return pathname === href || (!exact && pathname.startsWith(href + "/"));
}

interface NavDropdownProps {
  label: string;
  // Shown above the sections, across the full width of the menu.
  lead?: NavItem;
  // One section renders as a list; several render side by side as labelled columns.
  sections: NavSection[];
  open: boolean;
  onToggle: () => void;
  pathname: string;
}

// A click-to-open menu in the desktop nav. Open state lives in SiteNav, so only one
// menu is open at a time and a single listener handles outside clicks and Escape.
export default function NavDropdown({ label, lead, sections, open, onToggle, pathname }: NavDropdownProps) {
  const menuId = useId();
  const allItems = [...(lead ? [lead] : []), ...sections.flatMap((s) => s.items)];
  const containsActive = allItems.some((item) => isItemActive(pathname, item));
  const wide = sections.length > 1;

  const itemLink = (item: NavItem) => {
    const active = isItemActive(pathname, item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-baseline justify-between gap-4 px-4 py-2 text-sm hover:text-ink hover:bg-sand/50 transition-colors whitespace-nowrap ${active ? "text-ink font-medium" : "text-muted"}`}
      >
        {item.label}
        {item.count != null && <span className="text-xs text-muted/70 tabular-nums">{item.count}</span>}
      </Link>
    );
  };

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
          className={`absolute top-full mt-2 bg-cream border border-sand rounded-xl shadow-md py-2 ${wide ? "left-1/2 -translate-x-1/2" : "left-0 min-w-[160px]"}`}
        >
          {lead && <div className="border-b border-sand mb-2 pb-2 font-medium">{itemLink(lead)}</div>}
          {wide ? (
            <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)]">
              {sections.map((section) => (
                <div key={section.label}>
                  {section.label && (
                    <div className="px-4 pt-1 pb-1 text-xs text-muted uppercase tracking-widest whitespace-nowrap">{section.label}</div>
                  )}
                  {section.items.map(itemLink)}
                </div>
              ))}
            </div>
          ) : (
            sections[0]?.items.map(itemLink)
          )}
        </div>
      )}
    </div>
  );
}

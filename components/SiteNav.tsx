"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import NavDropdown, { NavItem } from "@/components/NavDropdown";

// The site-wide top navigation, rendered once in app/layout.tsx.
// From md up: Products and Learn dropdowns. Below md: a menu button that opens a
// full-width panel listing the same links. "Build my plan" shows at every size.
const MENUS: { label: string; items: NavItem[] }[] = [
  {
    label: "Products",
    items: [
      { href: "/products", label: "All products" },
      { href: "/search", label: "Search" },
      { href: "/compare", label: "Compare" },
      { href: "/query", label: "Explore" },
      { href: "/ingredients", label: "Ingredients" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/blog", label: "Blog" },
      { href: "/guides", label: "Guides" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
];

// Open-state key for the mobile panel; the dropdowns use their labels.
const MOBILE = "mobile";

export default function SiteNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggle = (key: string) => setOpenMenu((current) => (current === key ? null : key));
  const mobileOpen = openMenu === MOBILE;

  // Close any open menu after navigating.
  useEffect(() => setOpenMenu(null), [pathname]);

  // While a menu is open, close it on a click outside every menu, on a link click
  // (including one to the current page, which doesn't change the path) or on Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-nav-menu]") || target.closest("a")) setOpenMenu(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Return focus to the open menu's trigger before it closes.
      document.querySelector<HTMLButtonElement>("nav button[aria-expanded='true']")?.focus();
      setOpenMenu(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // The mobile panel stops the page scrolling behind it, and closes if the screen
  // widens past md (e.g. rotating a tablet), where it is hidden.
  useEffect(() => {
    if (!mobileOpen) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const onWiden = () => wide.matches && setOpenMenu(null);
    document.body.style.overflow = "hidden";
    wide.addEventListener("change", onWiden);
    return () => {
      document.body.style.overflow = "";
      wide.removeEventListener("change", onWiden);
    };
  }, [mobileOpen]);

  return (
    <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Pello Nutrition home">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <div className="hidden md:flex items-center gap-5">
            {MENUS.map(({ label, items }) => (
              <NavDropdown
                key={label}
                label={label}
                items={items}
                open={openMenu === label}
                onToggle={() => toggle(label)}
                isActive={isActive}
              />
            ))}
          </div>

          <Link href="/quiz" className="hidden min-[360px]:inline-block btn-secondary text-xs py-1.5 px-3 whitespace-nowrap">
            Build my plan →
          </Link>

          <button
            type="button"
            data-nav-menu
            onClick={() => toggle(MOBILE)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden -mr-2 h-10 w-10 flex items-center justify-center rounded-lg text-ink hover:bg-sand/50 transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? <path d="M5 5l10 10M15 5 5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          {/* Dims the page below the nav; a tap here counts as an outside click. Positioned
              off the nav rather than fixed, since the nav's backdrop-blur would contain it. */}
          <div aria-hidden="true" className="md:hidden absolute inset-x-0 top-full h-[100dvh] bg-ink/20" />
          <div
            id="mobile-nav"
            data-nav-menu
            className="md:hidden absolute inset-x-0 top-full bg-cream border-b border-sand shadow-md max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
          >
            <div className="px-6 py-4 space-y-5">
              {MENUS.map(({ label, items }) => (
                <div key={label}>
                  <div className="text-xs text-muted uppercase tracking-widest mb-1">{label}</div>
                  {items.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={`block -mx-3 px-3 py-3 rounded-lg text-base transition-colors hover:bg-sand/50 ${isActive(href) ? "text-moss font-medium bg-moss/5" : "text-ink"}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/quiz" className="btn-primary block text-center py-3">Build my plan →</Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

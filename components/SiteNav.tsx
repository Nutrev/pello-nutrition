"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import NavDropdown, { NavItem, NavSection, isItemActive } from "@/components/NavDropdown";
import { categorySlug } from "@/lib/catalog-types";
import { CATEGORY_GROUPS, OTHER_GROUP } from "@/lib/category-groups";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { PRO_ENABLED } from "@/lib/pro";

// The site-wide top navigation, rendered once in app/layout.tsx.
// From md up: Products, Tools and Learn dropdowns. Below md: a menu button that opens a
// full-width panel listing the same links. "Build my plan" shows at every size.

const ALL_PRODUCTS: NavItem = { href: "/products", label: "All products", exact: true };
const BRANDS: NavItem = { href: "/brands", label: "Brands" };

const OTHER_MENUS: { label: string; items: NavItem[] }[] = [
  {
    label: "Tools",
    items: [
      { href: "/search", label: "Search" },
      { href: "/compare", label: "Compare" },
      { href: "/query", label: "Explore" },
      { href: "/ingredients", label: "Ingredients" },
      { href: "/fueling", label: "Gut training and race day" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/blog", label: "Blog" },
      { href: "/guides", label: "Guides", exact: true },
      { href: "/guides/certifications", label: "Certification guides" },
      { href: "/methodology", label: "Methodology" },
    ],
  },
];

export type CategoryCount = { name: string; count: number };

function categorySections(categories: CategoryCount[]): NavSection[] {
  const toItem = ({ name, count }: CategoryCount): NavItem => ({ href: `/products/${categorySlug(name)}`, label: name, count });
  const grouped = new Set(CATEGORY_GROUPS.flatMap((g) => g.categories));
  const sections = CATEGORY_GROUPS.map((group) => ({
    label: group.label,
    items: group.categories.flatMap((name) => categories.filter((c) => c.name === name)).map(toItem),
  }));
  const other = categories.filter((c) => !grouped.has(c.name)).map(toItem);
  return [...sections, ...(other.length ? [{ label: OTHER_GROUP, items: other }] : [])].filter((s) => s.items.length);
}

// Open-state key for the mobile panel; the dropdowns use their labels.
const MOBILE = "mobile";

export default function SiteNav({ categories }: { categories: CategoryCount[] }) {
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useUser();
  const { isPro } = useSubscription();
  const showPro = PRO_ENABLED && isPro;
  const initial = (profile?.username || user?.email || "?").trim().charAt(0).toUpperCase();
  const productSections = categorySections(categories);
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

  // A row in the mobile panel; `compact` is for the two-column category grid.
  const mobileLink = (item: NavItem, compact = false) => {
    const active = isItemActive(pathname, item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-baseline justify-between gap-2 rounded-lg transition-colors hover:bg-sand/50 ${compact ? "-mx-2 px-2 py-2 text-sm" : "-mx-3 px-3 py-3 text-base"} ${active ? "text-moss font-medium bg-moss/5" : "text-ink"}`}
      >
        {item.label}
        {item.count != null && <span className="text-xs text-muted tabular-nums">{item.count}</span>}
      </Link>
    );
  };

  return (
    <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Pello Nutrition home">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <div className="hidden md:flex items-center gap-5">
            <NavDropdown
              label="Products"
              lead={[ALL_PRODUCTS, BRANDS]}
              sections={productSections}
              open={openMenu === "Products"}
              onToggle={() => toggle("Products")}
              pathname={pathname}
            />
            {OTHER_MENUS.map(({ label, items }) => (
              <NavDropdown
                key={label}
                label={label}
                sections={[{ items }]}
                open={openMenu === label}
                onToggle={() => toggle(label)}
                pathname={pathname}
              />
            ))}
          </div>

          <Link href="/quiz" className="hidden min-[360px]:inline-block btn-secondary text-xs py-1.5 px-3 whitespace-nowrap">
            Build my plan →
          </Link>

          {/* Account: hidden until the session check finishes, so the wrong state never flashes */}
          <div className={`hidden md:flex items-center gap-3 ${authLoading ? "invisible" : ""}`}>
            {PRO_ENABLED && user && !isPro && (
              <Link href="/pricing" className="text-xs bg-amber/10 text-amber px-2 py-1 rounded-md whitespace-nowrap hover:bg-amber/20 transition-colors">Upgrade to Pro</Link>
            )}
            {PRO_ENABLED && !user && (
              <Link href="/pricing" className={`text-sm transition-colors ${pathname === "/pricing" ? "text-ink font-medium" : "text-muted hover:text-ink"}`}>Pricing</Link>
            )}
            {user ? (
              <Link href="/account" aria-label={showPro ? "Your account (Pello Pro)" : "Your account"} className={`flex items-center gap-2 text-sm transition-colors ${pathname.startsWith("/account") ? "text-ink font-medium" : "text-muted hover:text-ink"}`}>
                <span aria-hidden="true" className="h-7 w-7 rounded-full bg-moss text-cream flex items-center justify-center text-xs font-medium">{initial}</span>
                Account
                {showPro && <span aria-hidden="true" className="text-[10px] uppercase tracking-wider bg-amber/10 text-amber px-1.5 py-0.5 rounded">Pro</span>}
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">Log in</Link>
            )}
          </div>

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
              <div>
                <div className="text-xs text-muted uppercase tracking-widest mb-1">Products</div>
                {mobileLink(ALL_PRODUCTS)}
                {mobileLink(BRANDS)}
                {productSections.map((section) => (
                  <div key={section.label} className="mt-3">
                    <div className="text-xs text-muted mb-1">{section.label}</div>
                    <div className="grid grid-cols-2 gap-x-4">
                      {section.items.map((item) => mobileLink(item, true))}
                    </div>
                  </div>
                ))}
              </div>
              {OTHER_MENUS.map(({ label, items }) => (
                <div key={label}>
                  <div className="text-xs text-muted uppercase tracking-widest mb-1">{label}</div>
                  {items.map((item) => mobileLink(item))}
                </div>
              ))}
              <div>
                <div className="text-xs text-muted uppercase tracking-widest mb-1">Account</div>
                {user ? (
                  mobileLink({ href: "/account", label: showPro ? "Your account · Pro" : "Your account" })
                ) : (
                  mobileLink({ href: "/auth/login", label: "Log in" })
                )}
                {PRO_ENABLED && !isPro && mobileLink({ href: "/pricing", label: user ? "Upgrade to Pro" : "Pricing" })}
              </div>
              <Link href="/quiz" className="btn-primary block text-center py-3">Build my plan →</Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

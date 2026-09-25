"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

// The site-wide top navigation, rendered once in app/layout.tsx.
// Links are hidden progressively on narrower screens; Blog and the planner button always show.
const LINKS = [
  { href: "/products", label: "All products", show: "hidden sm:block" },
  { href: "/search", label: "Search", show: "hidden md:block" },
  { href: "/guides", label: "Guides", show: "hidden md:block" },
  { href: "/compare", label: "Compare", show: "hidden md:block" },
  { href: "/query", label: "Explore", show: "hidden lg:block" },
  { href: "/ingredients", label: "Ingredients", show: "hidden lg:block" },
  { href: "/blog", label: "Blog", show: "" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" aria-label="Pello Nutrition home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {LINKS.map(({ href, label, show }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`${show} text-sm transition-colors ${isActive(href) ? "text-ink font-medium" : "text-muted hover:text-ink"}`}
            >
              {label}
            </Link>
          ))}
          <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
        </div>
      </div>
    </nav>
  );
}

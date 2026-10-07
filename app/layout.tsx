import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import AuthProvider from "@/components/AuthProvider";
import Analytics, { CookieSettingsLink } from "@/components/Analytics";
import { AFFILIATES_ACTIVE, AMAZON_ACTIVE, AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate";
import { LogoMark } from "@/components/Logo";
import { getCatalogStats, getCategoryCounts } from "@/lib/catalog";

const { productCount } = getCatalogStats();

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
// Used only by the logo (components/Logo.tsx).
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-logo" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pellonutrition.com"),
  // Every page names its own address (without query strings) as the canonical one, so
  // Google doesn't treat ?mode=…, ?ref=… and similar variants as duplicates. Pages that set
  // their own canonical override this.
  alternates: { canonical: "./" },
  title: {
    default: "Pello — Sports Nutrition Research for Endurance Athletes",
    template: "%s | Pello Nutrition",
  },
  description: `Science-backed reviews, ingredient analysis and AI-powered nutrition plans for endurance athletes. Compare energy gels, drink mixes, protein and supplements across ${productCount} products.`,
  keywords: ["sports nutrition", "energy gels", "endurance nutrition", "nutrition research", "sports supplements", "cycling nutrition", "marathon nutrition", "triathlon nutrition"],
  authors: [{ name: "Pello Nutrition" }],
  creator: "Pello Nutrition",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.pellonutrition.com",
    siteName: "Pello Nutrition",
    title: "Pello — Sports Nutrition Research for Endurance Athletes",
    description: "Science-backed reviews, ingredient analysis and AI-powered nutrition plans for endurance athletes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pello — Sports Nutrition Research",
    description: "Science-backed reviews and AI-powered nutrition plans for endurance athletes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${montserrat.variable}`}>
      <body className="bg-cream text-ink antialiased">
        <AuthProvider>
          <SiteNav categories={getCategoryCounts()} />
          {children}
          {/* Affiliate disclosure: shown once any affiliate program is switched on (lib/affiliate.ts) */}
          {AFFILIATES_ACTIVE && (
            <div className="border-t border-sand bg-sand/30 py-3 print:hidden">
              <div className="max-w-5xl mx-auto px-6">
                <p className="text-xs text-muted font-mono">
                  {AMAZON_ACTIVE && `${AMAZON_ASSOCIATE_STATEMENT} `}
                  Pello Nutrition participates in affiliate programs and may earn commissions on purchases made through
                  links on this site — this never influences our editorial scores or recommendations.
                  <a href="/legal/affiliate-disclosure" className="text-moss underline ml-1">Affiliate disclosure →</a>
                </p>
              </div>
            </div>
          )}
          <footer className="border-t border-sand py-8 mt-auto print:hidden">
            <Link href="/" aria-label="Pello Nutrition home" className="block w-fit mx-auto mb-5">
              <LogoMark className="w-20 h-auto" />
            </Link>
            <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-xs text-muted">
              <span>© 2026 Pello Nutrition LLC · All rights reserved</span>
              <Link href="/about">About</Link>
              <Link href="/legal/privacy">Privacy Policy</Link>
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
              <CookieSettingsLink className="hover:text-ink" />
            </div>
          </footer>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}

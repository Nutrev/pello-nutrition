import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { LogoMark } from "@/components/Logo";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pellonutrition.com"),
  title: {
    default: "Pello — Sports Nutrition Research for Endurance Athletes",
    template: "%s | Pello Nutrition",
  },
  description: "Science-backed reviews, ingredient analysis and AI-powered nutrition plans for endurance athletes. Compare energy gels, drink mixes, protein and supplements across 240+ products.",
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
    <html lang="en" className={dmSans.variable}>
      <body className="bg-cream text-ink antialiased">
        <SiteNav />
        {children}
        <footer className="border-t border-sand py-8 mt-auto">
          <Link href="/" aria-label="Pello Nutrition home" className="block w-fit mx-auto mb-5">
            <LogoMark className="w-20 h-auto" />
          </Link>
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-xs text-muted">
            <span>© 2026 Pello Nutrition</span>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <Link href="/legal/terms">Terms of Service</Link>
            <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

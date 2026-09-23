import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pellonutrition.com"),
  title: {
    default: "Pello — Sports Nutrition Research for Endurance Athletes",
    template: "%s | Pello Nutrition",
  },
  description: "Science-backed reviews, ingredient analysis and AI-powered nutrition plans for endurance athletes. Compare energy gels, drink mixes, protein and supplements across 120+ products.",
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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pello Nutrition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pello — Sports Nutrition Research",
    description: "Science-backed reviews and AI-powered nutrition plans for endurance athletes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}

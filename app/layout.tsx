import type { Metadata } from "next";
import type { ReactNode } from "react";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "Pello — Sports Nutrition Research",
  description: "AI-powered sports nutrition research. Aggregated reviews, science-backed ingredient analysis, and personalised recommendations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-ink font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
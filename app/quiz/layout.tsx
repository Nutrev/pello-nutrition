import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Nutrition Plan",
  description: "Get a personalised pre, during and post nutrition plan for your next race or training session. AI-powered recommendations based on your event, duration, intensity and budget.",
  openGraph: {
    title: "Build Your Nutrition Plan | Pello",
    description: "AI-powered nutrition plans for endurance athletes. Personalised pre, during and post recommendations.",
    url: "https://www.pellonutrition.com/quiz",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
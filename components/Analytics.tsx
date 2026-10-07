"use client";

// Google Analytics, only with the visitor's consent. Nothing from Google loads until they
// accept; declining (or later withdrawing) disables it and removes its cookies. The choice is
// kept in this browser's local storage. Analytics storage only: the advertising consents stay
// denied until Pello runs ads and asks for them.
//
// Page views are sent here on each route change, skipping account, admin and login pages.
// In Google Analytics → Admin → Data streams → Enhanced measurement, "Page changes based on
// browser history events" should be off so those pages aren't counted another way.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const GA_ID = "G-98QTVJE4V4";
const KEY = "pello_analytics_consent";
const OPEN_EVENT = "pello:cookie-settings";
const NOT_TRACKED = ["/account", "/admin", "/auth"];

type Choice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(c: Choice) {
  try { localStorage.setItem(KEY, c); } catch {}
}

const disableFlag = `ga-disable-${GA_ID}`;
const tracked = (path: string) => !NOT_TRACKED.some((p) => path === p || path.startsWith(`${p}/`));

// Sets up gtag and loads Google's script, once.
function startAnalytics() {
  (window as unknown as Record<string, unknown>)[disableFlag] = false;
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

// Stops Google Analytics on this page and deletes its cookies (_ga and _ga_<id>).
function stopAnalytics() {
  (window as unknown as Record<string, unknown>)[disableFlag] = true;
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => n === "_ga" || n.startsWith("_ga_")).forEach((name) => {
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

// "Cookie settings" in the footer: shows the banner again so the visitor can change their mind.
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie settings
    </button>
  );
}

export default function Analytics() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setOpen(c === null);
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  useEffect(() => {
    if (choice === "granted") startAnalytics();
  }, [choice]);

  useEffect(() => {
    if (choice !== "granted" || !window.gtag || !tracked(pathname)) return;
    window.gtag("event", "page_view", { page_location: location.href, page_title: document.title });
  }, [choice, pathname]);

  const decide = (c: Choice) => {
    saveChoice(c);
    if (c === "denied") stopAnalytics();
    setChoice(c);
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div role="dialog" aria-label="Cookie choice" className="fixed inset-x-0 bottom-0 z-50 p-4 print:hidden pointer-events-none">
      <div className="pointer-events-auto max-w-lg mx-auto card shadow-lg">
        <p className="text-sm text-ink mb-1 font-medium">Can we use analytics cookies?</p>
        <p className="text-xs text-muted leading-relaxed mb-3">
          With your OK, Pello uses Google Analytics to see which pages are visited and how the site is used, so we can
          improve it. Nothing is loaded from Google unless you accept, and account pages are never tracked.{" "}
          <Link href="/legal/privacy" className="text-moss underline">Privacy policy</Link>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => decide("denied")} className="btn-secondary justify-center flex text-sm">Decline</button>
          <button type="button" onClick={() => decide("granted")} className="btn-secondary justify-center flex text-sm">Accept</button>
        </div>
        {choice && <p className="text-[11px] text-muted mt-2">Currently: {choice === "granted" ? "accepted" : "declined"}.</p>}
      </div>
    </div>
  );
}

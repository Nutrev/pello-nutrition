// lib/auth.ts
// Account helpers for client components: the signed-in user, sign in/up/out and profile
// updates. Auth state comes from components/AuthProvider.tsx.
import { useAuthContext } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadBrowserSupabase, announceAuthChange } from "./supabase/load";
import type { UserProfile } from "./account-types";

// Current user and profile; `loading` is true until the session has been checked.
export function useUser() {
  return useAuthContext();
}

// The Supabase client, loaded on demand; null until it's ready.
export function useSupabaseClient(): SupabaseClient | null {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  useEffect(() => { loadBrowserSupabase().then(setClient); }, []);
  return client;
}

function callbackUrl(next: string): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

// Turns Supabase's auth errors into plain messages.
export function friendlyAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Try logging in instead.";
  if (m.includes("password should be") || m.includes("weak password")) return "Please choose a stronger password (at least 8 characters).";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) return "Google sign-in isn't available yet. Please use email and password.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  return message || "Something went wrong. Please try again.";
}

export async function signIn(email: string, password: string) {
  const result = await (await loadBrowserSupabase()).auth.signInWithPassword({ email, password });
  if (!result.error) announceAuthChange();
  return result;
}

// When email confirmation is on, no session comes back until the user clicks the link.
// `then` is where to go after onboarding (e.g. back to the product being saved).
export function onboardingPath(then?: string): string {
  return then ? `/account/onboarding?then=${encodeURIComponent(then)}` : "/account/onboarding";
}

export async function signUp(email: string, password: string, then?: string) {
  const result = await (await loadBrowserSupabase()).auth.signUp({
    email, password, options: { emailRedirectTo: callbackUrl(onboardingPath(then)) },
  });
  if (result.data.session) announceAuthChange();
  return result;
}

export async function signInWithGoogle(next = "/account") {
  return (await loadBrowserSupabase()).auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl(next) } });
}

export async function signOut() {
  const result = await (await loadBrowserSupabase()).auth.signOut();
  announceAuthChange();
  return result;
}

export async function sendPasswordReset(email: string) {
  return (await loadBrowserSupabase()).auth.resetPasswordForEmail(email, { redirectTo: callbackUrl("/auth/update-password") });
}

export async function updatePassword(password: string) {
  return (await loadBrowserSupabase()).auth.updateUser({ password });
}

// Creates or updates the signed-in user's profile row.
export async function updateProfile(data: Partial<Omit<UserProfile, "id" | "created_at">>) {
  const supabase = await loadBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not signed in" } };
  return supabase.from("user_profiles").upsert({ id: user.id, ...data });
}

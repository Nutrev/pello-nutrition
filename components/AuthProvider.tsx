"use client";

// Signed-in state for the whole site: the Supabase user, their profile row and (once Pello
// Pro is switched on) their subscription row.
// Checked in the browser so every page can stay statically rendered. Supabase's code is
// only downloaded when there's a session cookie (or after signing in), so signed-out
// visitors don't pay for it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { loadBrowserSupabase, hasAuthCookie, AUTH_EVENT } from "@/lib/supabase/load";
import type { UserProfile } from "@/lib/account-types";
import { PRO_ENABLED, type SubscriptionRow } from "@/lib/pro";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  subscription: SubscriptionRow | null;
  loading: boolean;             // true until the first session check finishes
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ user: null, profile: null, subscription: null, loading: true, refreshProfile: async () => {} });

export function useAuthContext() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (supabase: SupabaseClient, u: User | null) => {
    if (!u) { setProfile(null); setSubscription(null); return; }
    const [{ data }, sub] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", u.id).maybeSingle(),
      PRO_ENABLED ? supabase.from("subscriptions").select("*").eq("user_id", u.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setProfile((data as UserProfile | null) ?? null);
    setSubscription((sub.data as SubscriptionRow | null) ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const check = async () => {
      if (!hasAuthCookie()) {
        if (active) { setUser(null); setProfile(null); setSubscription(null); setLoading(false); }
        return;
      }
      const supabase = await loadBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(data.user);
      await loadProfile(supabase, data.user);
      if (active) setLoading(false);
      if (!unsubscribe) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          const u = session?.user ?? null;
          setUser(u);
          loadProfile(supabase, u);
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      }
    };

    check();
    window.addEventListener(AUTH_EVENT, check);
    return () => { active = false; unsubscribe?.(); window.removeEventListener(AUTH_EVENT, check); };
  }, [loadProfile]);

  const value = useMemo<AuthState>(() => ({
    user, profile, subscription, loading,
    refreshProfile: async () => loadProfile(await loadBrowserSupabase(), user),
  }), [user, profile, subscription, loading, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

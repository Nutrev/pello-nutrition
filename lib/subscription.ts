// lib/subscription.ts
// Client-side Pro status. The subscription row is loaded with the user in AuthProvider.
import { useUser } from "./auth";
import { PRO_ENABLED, rowIsPro } from "./pro";

export function useSubscription() {
  const { subscription, loading } = useUser();
  const isPro = rowIsPro(subscription);
  return {
    isPro,
    subscriptionEnd: subscription?.current_period_end ? new Date(subscription.current_period_end) : null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    trialEnd: subscription?.trial_end ? new Date(subscription.trial_end) : null,
    hadTrial: subscription?.had_trial ?? false,
    loading,
  };
}

// Whether the signed-in user can use a Pro feature. Always true while Pro is switched off.
export function useProAccess() {
  const { user, loading } = useUser();
  const { isPro } = useSubscription();
  return { allowed: !PRO_ENABLED || isPro, isPro, signedIn: !!user, loading, gating: PRO_ENABLED };
}

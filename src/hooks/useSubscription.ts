import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionState {
  loading: boolean;
  subscribed: boolean;
  tier: string | null;
  endDate: string | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscribed(false);
      setTier(null);
      setEndDate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // First read cache from DB for instant UI
      const { data: cached } = await supabase
        .from("subscribers")
        .select("subscribed, subscription_tier, subscription_end")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cached) {
        setSubscribed(!!cached.subscribed);
        setTier(cached.subscription_tier);
        setEndDate(cached.subscription_end);
      }

      // Then verify with Stripe
      const env = getStripeEnvironment();
      const { data, error } = await supabase.functions.invoke(
        `check-subscription?env=${env}`,
        { method: "POST" },
      );
      if (!error && data) {
        setSubscribed(!!data.subscribed);
        setTier(data.subscription_tier ?? null);
        setEndDate(data.subscription_end ?? null);
      }
    } catch (e) {
      console.error("subscription check failed", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, subscribed, tier, endDate, refresh };
}
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getStripeEnvironment } from "@/lib/stripe";
import { FREE_PRO_MODE } from "@/lib/free-access";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

function computeIsActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const inFuture = end === null || end > Date.now();
  if (["active", "trialing", "past_due"].includes(sub.status) && inFuture) return true;
  if (sub.status === "canceled" && end && end > Date.now()) return true;
  return false;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  // Track the last successful fetch so we don't hammer the database every
  // time the tab gains focus. Only refetch if data is older than 30s.
  const lastFetchedAt = useRef<number>(0);

  const fetchSub = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("id,status,price_id,current_period_end,cancel_at_period_end,stripe_customer_id,stripe_subscription_id")
      .eq("user_id", user.id)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription(data ?? null);
    setLoading(false);
    lastFetchedAt.current = Date.now();
  }, [user?.id]);

  useEffect(() => {
    fetchSub();

    // visibilitychange already fires when the tab returns to focus, so we
    // don't need a separate `focus` listener (that would double-fetch).
    // Throttle to once every 30s to absorb rapid tab switching.
    const refreshOnFocus = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchedAt.current < 30_000) return;
      fetchSub();
    };

    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [fetchSub]);

  // Early access: every signed-in account gets Pro for free.
  const paidPro = computeIsActive(subscription);
  const isPro = FREE_PRO_MODE ? !!user : paidPro;
  return { subscription, isPro, paidPro, freeMode: FREE_PRO_MODE, loading, refetch: fetchSub };
}
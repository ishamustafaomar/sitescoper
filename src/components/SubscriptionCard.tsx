import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ExternalLink, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export function SubscriptionCard() {
  const { isPro, subscription, loading } = useSubscription();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.origin + "/account", environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to open billing portal");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const renewLabel = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Crown className="h-4 w-4 text-muted-foreground" />
          Subscription
        </h2>
        {isPro && (
          <span className="text-xs font-body px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Pro
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : isPro ? (
        <div className="space-y-3">
          <div className="text-sm font-body space-y-1">
            <div>
              <span className="text-muted-foreground">Plan:</span>{" "}
              <span className="font-medium">{subscription?.price_id === "pro_yearly" ? "Pro · Yearly" : "Pro · Monthly"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium capitalize">{subscription?.status}</span>
            </div>
            {renewLabel && (
              <div>
                <span className="text-muted-foreground">
                  {subscription?.cancel_at_period_end || subscription?.status === "canceled" ? "Access ends:" : "Renews:"}
                </span>{" "}
                <span className="font-medium">{renewLabel}</span>
              </div>
            )}
            {subscription?.cancel_at_period_end && (
              <p className="text-xs text-muted-foreground italic pt-1">
                Cancellation scheduled — you keep Pro access until the date above.
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
            {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            Manage billing
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-body">
            You're on the Free plan — 1 scan / month. Upgrade for unlimited scans, history, chat, ideas & PDF export.
          </p>
          <Button size="sm" onClick={() => navigate("/pricing")}>
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade to Pro
          </Button>
        </div>
      )}
    </section>
  );
}
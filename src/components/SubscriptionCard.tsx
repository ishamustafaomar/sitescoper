import { Sparkles, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionCard() {
  const { isPro, subscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.href, environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message || "Could not open billing portal");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Plan
        </h2>
        <span className={`text-xs font-body px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${isPro ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
          {isPro ? <><Crown className="h-3 w-3" /> Pro</> : "Free"}
        </span>
      </div>
      {isPro ? (
        <>
          <p className="text-sm text-muted-foreground font-body">
            You're on SiteScoper Pro — unlimited scans, deep product simulation, competitor compare, chat-with-report and PDF exports are all unlocked.
          </p>
          {subscription?.stripe_customer_id && (
            <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
              Manage billing
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground font-body">
            You're on the Free plan — 3 scans per month. Upgrade to Pro for unlimited scans and every advanced feature unlocked.
          </p>
          <Button size="sm" className="shadow-glow" onClick={() => navigate("/pricing")}>
            <Crown className="h-4 w-4" /> Upgrade to Pro
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </section>
  );
}
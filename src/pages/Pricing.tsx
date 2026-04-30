import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

const FREE_FEATURES = [
  "1 free analysis to start",
  "Overall score & traffic-light breakdown",
  "Top action items",
  "Single-page audit",
];

const PRO_FEATURES = [
  "Unlimited site analyses",
  "Product ideas & strategy section",
  "Full analysis history & saved sites",
  "Chat with your report (AI)",
  "1-click PDF export",
  "Side-by-side competitor compare",
  "Priority Gemini-powered scans",
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, subscription } = useSubscription();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const priceId = interval === "monthly" ? "pro_monthly" : "pro_yearly";

  const handleStart = () => {
    if (!user) { navigate("/auth?redirect=/pricing"); return; }
    setCheckoutOpen(true);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: window.location.origin + "/account", environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to open portal");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body mb-4">
            <Sparkles className="h-3 w-3" /> Pricing
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Ship a better site, faster.</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Free forever for one-off audits. Go Pro for unlimited scans, history, ideas, chat & PDF.</p>
        </div>

        {!checkoutOpen && (
          <>
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 rounded-full bg-muted">
                <button
                  onClick={() => setInterval("monthly")}
                  className={`px-4 py-1.5 text-sm font-body rounded-full transition ${interval === "monthly" ? "bg-background shadow" : "text-muted-foreground"}`}
                >Monthly</button>
                <button
                  onClick={() => setInterval("yearly")}
                  className={`px-4 py-1.5 text-sm font-body rounded-full transition ${interval === "yearly" ? "bg-background shadow" : "text-muted-foreground"}`}
                >Yearly <span className="text-accent ml-1">save 30%</span></button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-bold mb-1">Free</h2>
                <p className="text-muted-foreground text-sm mb-4">For occasional audits.</p>
                <div className="mb-6"><span className="text-4xl font-heading font-bold">$0</span><span className="text-muted-foreground"> / forever</span></div>
                <ul className="space-y-2 mb-6">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Stay on Free</Button>
              </Card>

              <Card className="p-8 border-primary shadow-glow relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-body">Most popular</div>
                <h2 className="font-heading text-2xl font-bold mb-1">Pro</h2>
                <p className="text-muted-foreground text-sm mb-4">Everything you need to ship.</p>
                <div className="mb-6">
                  {interval === "monthly" ? (
                    <><span className="text-4xl font-heading font-bold">$19</span><span className="text-muted-foreground"> / month</span></>
                  ) : (
                    <><span className="text-4xl font-heading font-bold">$159</span><span className="text-muted-foreground"> / year</span><div className="text-xs text-accent mt-1">~$13.25/mo · save $69</div></>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                {isPro ? (
                  <Button className="w-full" onClick={handlePortal} disabled={portalLoading}>
                    {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Manage subscription
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleStart}>Upgrade to Pro</Button>
                )}
                {isPro && subscription?.cancel_at_period_end && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">Cancels on {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "period end"}</p>
                )}
              </Card>
            </div>
          </>
        )}

        {checkoutOpen && (
          <Card className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="font-heading text-lg font-semibold">Complete your upgrade</h2>
              <Button variant="ghost" size="sm" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            </div>
            <StripeEmbeddedCheckoutForm
              priceId={priceId}
              customerEmail={user?.email}
              userId={user?.id}
              returnUrl={`${window.location.origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
            />
          </Card>
        )}
      </main>
    </div>
  );
}
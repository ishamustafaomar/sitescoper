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

// Side-by-side rows: Free account (signed in, no subscription) vs Pro account.
// Same row = same capability so users can compare directly.
const COMPARISON_ROWS: { label: string; free: string | boolean; pro: string | boolean; highlight?: boolean }[] = [
  { label: "Site analyses",                                   free: "1 / month",       pro: "Unlimited",                  highlight: true },
  { label: "Overall score & traffic-light breakdown",         free: true,              pro: true },
  { label: "Action items per scan",                           free: "Top 3 only",      pro: "Full prioritized roadmap",   highlight: true },
  { label: "Deep product reasoning (AI plays your product)",  free: "Surface only",    pro: "Full deep simulation",       highlight: true },
  { label: "Product ideas & strategy section",                free: false,             pro: true },
  { label: "Saved analysis history",                          free: "Last 1 scan",     pro: "Unlimited & searchable" },
  { label: "Saved websites for re-scanning",                  free: "Up to 1",         pro: "Unlimited" },
  { label: "Side-by-side competitor compare",                 free: "Preview only",    pro: "Full battle mode",           highlight: true },
  { label: "Chat with your report (AI)",                      free: false,             pro: true },
  { label: "1-click PDF export",                              free: false,             pro: true },
  { label: "Priority Gemini-powered scans",                   free: false,             pro: true },
  { label: "Email support",                                   free: "Community",       pro: "Priority" },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, subscription } = useSubscription();
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Free account vs Pro account</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Both require an account. Free lets you try SiteScoper. Pro is where it actually plays your product, finds the bugs in your logic, and writes the fixes for you.</p>
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

            {/* Side-by-side comparison table */}
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="grid grid-cols-[1.4fr_1fr_1.2fr]">
                {/* Header row */}
                <div className="p-5 bg-muted/40 border-b border-border" />
                <div className="p-5 bg-muted/40 border-b border-border text-center">
                  <div className="font-heading text-lg font-bold">Free account</div>
                  <div className="text-xs text-muted-foreground mt-1">Signed in · no card</div>
                  <div className="mt-3"><span className="text-2xl font-heading font-bold">$0</span><span className="text-xs text-muted-foreground">/forever</span></div>
                </div>
                <div className="p-5 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b-2 border-primary text-center relative">
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-b-lg bg-primary text-primary-foreground text-[10px] font-body uppercase tracking-wider font-bold">★ Recommended</div>
                  <div className="font-heading text-lg font-bold text-primary mt-3">Pro account</div>
                  <div className="text-xs text-muted-foreground mt-1">For people shipping real products</div>
                  <div className="mt-3">
                    {interval === "monthly" ? (
                      <><span className="text-2xl font-heading font-bold">$19</span><span className="text-xs text-muted-foreground">/mo</span></>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground line-through mr-1">$19</span>
                        <span className="text-2xl font-heading font-bold">$13.25</span><span className="text-xs text-muted-foreground">/mo</span>
                        <div className="text-[10px] text-accent font-body mt-0.5">billed $159/yr · save $69</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Comparison rows */}
                {COMPARISON_ROWS.map((row, idx) => (
                  <div key={row.label} className="contents">
                    <div className={`p-4 border-b border-border text-sm font-body ${row.highlight ? "font-semibold" : ""} ${idx % 2 === 1 ? "bg-muted/20" : ""}`}>
                      {row.label}
                    </div>
                    <div className={`p-4 border-b border-border text-center text-sm ${idx % 2 === 1 ? "bg-muted/20" : ""}`}>
                      {row.free === true ? (
                        <Check className="h-4 w-4 text-muted-foreground inline" />
                      ) : row.free === false ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="text-muted-foreground">{row.free}</span>
                      )}
                    </div>
                    <div className={`p-4 border-b-2 border-primary/40 text-center text-sm bg-primary/5 ${row.highlight ? "font-semibold text-foreground" : ""}`}>
                      {row.pro === true ? (
                        <Check className="h-4 w-4 text-primary inline" />
                      ) : row.pro === false ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="text-foreground">{row.pro}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* CTA row */}
                <div className="p-5" />
                <div className="p-5 text-center">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/")}>Stay on Free</Button>
                </div>
                <div className="p-5 text-center bg-primary/5">
                  {isPro ? (
                    <Button className="w-full" onClick={handlePortal} disabled={portalLoading}>
                      {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Manage subscription
                    </Button>
                  ) : (
                    <Button className="w-full shadow-glow" size="lg" onClick={handleStart}>
                      <Sparkles className="h-4 w-4" /> Upgrade to Pro
                    </Button>
                  )}
                  {isPro && subscription?.cancel_at_period_end && (
                    <p className="text-xs text-muted-foreground mt-3">Cancels on {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "period end"}</p>
                  )}
                </div>
              </div>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">Cancel anytime. Keep Pro until the end of your paid period. No hidden fees.</p>
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
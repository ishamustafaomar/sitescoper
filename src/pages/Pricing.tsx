import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useCanonical } from "@/hooks/useCanonical";
import { toast } from "sonner";

const FEATURES_FREE = [
  "1-page website analysis",
  "Basic scoring (UX, SEO, performance)",
  "Limited suggestions",
];

const FEATURES_PRO = [
  "Unlimited deep multi-page analyses",
  "Product ideas, competitor & market context",
  "AI chat with your report",
  "PDF export & shareable reports",
  "Saved websites & score history",
  "Priority email support",
];

export default function Pricing() {
  useCanonical("/pricing");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, refresh } = useSubscription();
  const [yearly, setYearly] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const priceId = yearly ? "pro_yearly" : "pro_monthly";
  const monthlyEquivalent = yearly ? 15 : 19;

  const handleSubscribe = () => {
    if (!user) {
      toast.info("Sign in first to subscribe");
      navigate("/auth?redirect=/pricing");
      return;
    }
    if (subscribed) {
      toast.success("You're already on Pro!");
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Stop guessing. Start shipping.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Free gives you the score. Pro tells you exactly what to build next, who to compete
            with, and where the market is headed.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!yearly ? "font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={`text-sm ${yearly ? "font-semibold" : "text-muted-foreground"}`}>
              Yearly{" "}
              <span className="text-accent font-semibold">— save 21%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-heading font-bold text-xl">Free</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Try the analyzer with no commitment.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Use free version
            </Button>
          </Card>

          {/* Pro */}
          <Card className="p-6 flex flex-col border-primary/40 shadow-glow relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase">
              Recommended
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-bold text-xl">Pro</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Real product strategy, not just SEO tips.
            </p>
            <div className="mb-1">
              <span className="text-4xl font-bold">${monthlyEquivalent}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              {yearly ? "Billed $180 yearly" : "Billed monthly, cancel anytime"}
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {FEATURES_PRO.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="w-full gradient-primary" onClick={handleSubscribe}>
              {subscribed ? "You're on Pro" : "Upgrade to Pro"}
            </Button>
          </Card>
        </div>
      </main>

      <Dialog
        open={checkoutOpen}
        onOpenChange={(o) => {
          setCheckoutOpen(o);
          if (!o) refresh();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete your subscription</DialogTitle>
          </DialogHeader>
          {checkoutOpen && <StripeEmbeddedCheckout priceId={priceId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
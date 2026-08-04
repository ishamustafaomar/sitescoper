import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router-compat";
import { Check, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { toast } from "@/hooks/use-toast";

const FREE_PERKS: string[] = [
  "3 website scans per month",
  "Full prioritized action roadmap",
  "Category scores & findings",
  "No credit card required",
];

const PRO_PERKS: string[] = [
  "Unlimited site analyses",
  "Deep product simulation (AI plays your product)",
  "Side-by-side competitor battle mode",
  "Chat with your report (AI)",
  "1-click PDF export",
  "Unlimited, searchable history",
  "Priority Gemini-powered scans",
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { t } = useTranslation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const startCheckout = () => {
    if (!user) {
      navigate("/auth?redirect=/pricing");
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            {t("pricing.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isPro ? t("pricing.subtitlePro") : t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 md:p-8 flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-xl font-bold">Free</div>
              <div>
                <span className="text-4xl font-heading font-bold">$0</span>
                <span className="text-xs text-muted-foreground font-body ml-1">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {FREE_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              onClick={() => navigate(user ? (isPro ? "/account" : "/dashboard") : "/auth")}
              disabled={isPro}
            >
              {isPro
                ? t("pricing.freeDowngradeHint")
                : user
                  ? t("pricing.goDashboard")
                  : t("pricing.startFree")}
            </Button>
          </Card>

          <Card className="p-6 md:p-8 border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex flex-col relative">
            <span className="absolute -top-3 right-6 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider">
              Most popular
            </span>
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-xl font-bold text-primary inline-flex items-center gap-1.5">
                <Crown className="h-5 w-5" /> Pro
              </div>
              <div>
                <span className="text-4xl font-heading font-bold">$19</span>
                <span className="text-xs text-muted-foreground font-body ml-1">/month</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {PRO_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button variant="outline" disabled>
                <Check className="h-4 w-4" /> {t("pricing.currentPro")}
              </Button>
            ) : (
              <Button className="shadow-glow" onClick={startCheckout}>
                <Sparkles className="h-4 w-4" /> {t("pricing.upgradeCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          {isPro ? t("pricing.footnotePro") : t("pricing.footnote")}
        </p>

        {isPro && (
          <div className="mt-6 text-center">
            <Button variant="link" size="sm" onClick={() => navigate("/account")}>
              {t("pricing.manageInAccount")}
            </Button>
          </div>
        )}
      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-3xl p-0 max-h-[90vh] overflow-y-auto overscroll-contain">
          {user && (
            <StripeEmbeddedCheckoutForm
              priceId="pro_monthly"
              customerEmail={user.email ?? undefined}
              userId={user.id}
              onError={(code) => {
                if (code === "already_subscribed") {
                  setCheckoutOpen(false);
                  toast({
                    title: "You're already on Pro",
                    description: "Manage your subscription from the Account page.",
                  });
                  navigate("/account");
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
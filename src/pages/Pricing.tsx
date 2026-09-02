import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router-compat";
import { Check, Sparkles, Crown, ArrowRight, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FREE_PRO_MODE } from "@/lib/free-access";
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

/** Monthly $19; annual $180 = $15/mo, two months free. */
const MONTHLY_PRICE = 19;
const ANNUAL_PRICE = 180;
const ANNUAL_MONTHLY = 15;
const ANNUAL_SAVING = MONTHLY_PRICE * 12 - ANNUAL_PRICE;

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { t } = useTranslation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");

  const priceId = interval === "annual" ? "pro_annual" : "pro_monthly";

  const startCheckout = () => {
    if (FREE_PRO_MODE) {
      navigate(user ? "/dashboard" : "/auth?redirect=/dashboard");
      return;
    }
    if (!user) {
      navigate(`/auth?redirect=/pricing`);
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {FREE_PRO_MODE ? <EarlyAccessBanner /> : <PaymentTestModeBanner />}
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            {t("pricing.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {FREE_PRO_MODE
              ? t("earlyAccess.pricingSubtitle")
              : isPro
                ? t("pricing.subtitlePro")
                : t("pricing.subtitle")}
          </p>
        </div>

        {!isPro && !FREE_PRO_MODE && (
          <div className="flex flex-col items-center gap-2 mb-8">
            <div
              role="group"
              aria-label={t("pricing.billingInterval")}
              className="inline-flex border border-foreground"
            >
              {(["monthly", "annual"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInterval(v)}
                  aria-pressed={interval === v}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] font-body font-semibold transition-colors ${
                    interval === v
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "monthly" ? t("pricing.monthly") : t("pricing.annual")}
                </button>
              ))}
            </div>
            <p className="text-[12px] font-body text-muted-foreground">
              {t("pricing.annualSaving", { amount: `$${ANNUAL_SAVING}` })}
            </p>
          </div>
        )}

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
              <li className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                <X className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t("pricing.freeNoChat")}</span>
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={() => navigate(user ? (isPro ? "/account" : "/dashboard") : "/auth")}
              disabled={isPro && !FREE_PRO_MODE}
            >
              {FREE_PRO_MODE
                ? user
                  ? t("pricing.goDashboard")
                  : t("pricing.startFree")
                : isPro
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
              {FREE_PRO_MODE ? (
                <div className="text-right">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-lg font-heading font-bold text-muted-foreground line-through">$19</span>
                    <span className="text-4xl font-heading font-bold text-primary">$0</span>
                  </div>
                  <span className="text-[11px] text-primary font-body">{t("earlyAccess.freeForNow")}</span>
                </div>
              ) : (
                <div className="text-right">
                  <div className="flex items-baseline gap-2 justify-end">
                    {interval === "annual" && (
                      <span className="text-lg font-heading font-bold text-muted-foreground line-through">
                        ${MONTHLY_PRICE}
                      </span>
                    )}
                    <span className="text-4xl font-heading font-bold">
                      ${interval === "annual" ? ANNUAL_MONTHLY : MONTHLY_PRICE}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">/month</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-body">
                    {interval === "annual"
                      ? t("pricing.billedAnnually", { amount: `$${ANNUAL_PRICE}` })
                      : t("pricing.billedMonthly")}
                  </span>
                </div>
              )}
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {PRO_PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-body">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            {FREE_PRO_MODE ? (
              <Button className="shadow-glow" onClick={startCheckout}>
                <Sparkles className="h-4 w-4" /> {t("earlyAccess.claimCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : isPro ? (
              <Button variant="outline" disabled>
                <Check className="h-4 w-4" /> {t("pricing.currentPro")}
              </Button>
            ) : (
              <>
                <Button className="shadow-glow" onClick={startCheckout}>
                  <Sparkles className="h-4 w-4" /> {t("pricing.trialCta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-center text-[11px] font-body text-muted-foreground">
                  {t(interval === "annual" ? "pricing.trialSubAnnual" : "pricing.trialSubMonthly")}
                </p>
              </>
            )}
          </Card>
        </div>

        {!isPro && !FREE_PRO_MODE && (
          <div className="mt-8 border border-border p-5 flex items-start gap-3 max-w-2xl mx-auto">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-heading font-semibold text-sm">{t("pricing.guaranteeTitle")}</div>
              <p className="text-[13px] text-muted-foreground font-body leading-relaxed">
                {t("pricing.guaranteeBody")}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          {FREE_PRO_MODE ? t("earlyAccess.pricingFootnote") : isPro ? t("pricing.footnotePro") : t("pricing.footnote")}
        </p>

        {isPro && !FREE_PRO_MODE && (
          <div className="mt-6 text-center">
            <Button variant="link" size="sm" onClick={() => navigate("/account")}>
              {t("pricing.manageInAccount")}
            </Button>
          </div>
        )}

        {!isPro && (
          <section className="mt-16 max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl font-bold mb-6">{t("pricing.faqTitle")}</h2>
            <dl className="space-y-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="border-b border-border pb-5">
                  <dt className="font-heading font-semibold text-[15px] mb-1">{t(`pricing.faq${n}q`)}</dt>
                  <dd className="text-sm text-muted-foreground font-body leading-relaxed">
                    {t(`pricing.faq${n}a`)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>

      <Dialog open={checkoutOpen && !FREE_PRO_MODE} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-3xl p-0 max-h-[90vh] overflow-y-auto overscroll-contain">
          {user && (
            <StripeEmbeddedCheckoutForm
              priceId={priceId}
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

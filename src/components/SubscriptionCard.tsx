import { Sparkles, Crown, ArrowRight, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { FREE_PRO_MODE } from "@/lib/free-access";
import { createPortalSession } from "@/lib/create-portal-session.functions";
import { cancelSubscription } from "@/lib/cancel-subscription.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SubscriptionCard() {
  const { isPro, paidPro, subscription, refetch } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const scheduledToCancel = !!subscription?.cancel_at_period_end && isPro;
  // Use the environment the subscription was actually created in, so live
  // customers can still manage/cancel while the client runs in sandbox.
  const subEnv = (subscription?.environment as "live" | "sandbox" | undefined) ?? getStripeEnvironment();
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(i18n.resolvedLanguage, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const openPortal = async () => {
    setLoading(true);
    try {
      const data = await createPortalSession({
        data: { returnUrl: window.location.href, environment: subEnv },
      });
      if (!data?.url) throw new Error("Could not open billing portal");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (resume: boolean) => {
    setCancelling(true);
    try {
      await cancelSubscription({
        data: { environment: subEnv, resume },
      });
      toast({
        title: resume ? t("plan.resumedTitle") : t("plan.canceledTitle"),
        description: resume ? t("plan.resumedDesc") : t("plan.canceledDesc"),
      });
      await refetch();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("plan.title")}
        </h2>
        <span className={`text-xs font-body px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${isPro ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
          {isPro ? <><Crown className="h-3 w-3" /> {FREE_PRO_MODE ? t("earlyAccess.proFreeBadge") : "Pro"}</> : t("plan.free")}
        </span>
      </div>
      {FREE_PRO_MODE ? (
        <>
          <p className="text-sm text-muted-foreground font-body">{t("earlyAccess.accountDesc")}</p>
          {paidPro && subscription?.stripe_customer_id && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
                {t("plan.manageBilling")}
              </Button>
            </div>
          )}
        </>
      ) : isPro ? (
        <>
          {scheduledToCancel ? (
            <p className="text-sm text-muted-foreground font-body">
              {periodEnd
                ? t("plan.scheduledCancelWithDate", { date: periodEnd })
                : t("plan.scheduledCancel")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-body">{t("plan.proDesc")}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {subscription?.stripe_customer_id && (
              <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
                {t("plan.manageBilling")}
              </Button>
            )}
            {scheduledToCancel ? (
              <Button variant="outline" size="sm" onClick={() => handleCancel(true)} disabled={cancelling}>
                {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                {t("plan.resumeBtn")}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    {t("plan.downgradeBtn")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("plan.confirmDowngradeTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {periodEnd
                        ? t("plan.confirmDowngradeDescWithDate", { date: periodEnd })
                        : t("plan.confirmDowngradeDesc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("plan.keepPro")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(false)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("plan.confirmDowngrade")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground font-body">{t("plan.freeDesc")}</p>
          <Button size="sm" className="shadow-glow" onClick={() => navigate("/pricing")}>
            <Crown className="h-4 w-4" /> {t("plan.upgradeBtn")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </section>
  );
}
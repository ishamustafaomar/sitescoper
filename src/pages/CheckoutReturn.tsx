import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";

export default function CheckoutReturn() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPro, refetch } = useSubscription();
  const [waited, setWaited] = useState(0);

  useEffect(() => {
    if (isPro || waited > 20) return;
    const t = setTimeout(() => {
      refetch();
      setWaited((w) => w + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [isPro, waited, refetch]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t("checkoutReturn.metaTitle")}</title>
        <meta name="description" content={t("checkoutReturn.metaDesc")} />
        <link rel="canonical" href="https://sitescoper.com/checkout/return" />
        <meta property="og:title" content={t("checkoutReturn.metaTitle")} />
        <meta property="og:description" content={t("checkoutReturn.metaDesc")} />
        <meta property="og:url" content="https://sitescoper.com/checkout/return" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <AppHeader />
      <main className="max-w-xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-8 text-center space-y-5"
        >
          {isPro ? (
            <>
              <div className="inline-flex p-4 rounded-full bg-[hsl(var(--score-good))]/10">
                <CheckCircle2 className="h-10 w-10 text-[hsl(var(--score-good))]" />
              </div>
              <h1 className="font-heading text-3xl font-bold">{t("checkoutReturn.proTitle")}</h1>
              <p className="text-muted-foreground font-body">
                {t("checkoutReturn.proDesc")}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button onClick={() => navigate("/dashboard")}>
                  <Sparkles className="h-4 w-4" /> {t("checkoutReturn.goDashboard")}
                </Button>
                <Button variant="outline" onClick={() => navigate("/account")}>{t("checkoutReturn.manageBilling")}</Button>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <h1 className="font-heading text-2xl font-bold">{t("checkoutReturn.confirming")}</h1>
              <p className="text-sm text-muted-foreground font-body">
                {authLoading || !user
                  ? t("checkoutReturn.signingIn")
                  : t("checkoutReturn.syncing")}
              </p>
              {sessionId && <p className="text-[10px] text-muted-foreground/60 font-mono">{t("checkoutReturn.session", { id: sessionId.slice(0, 24) })}</p>}
              {waited > 10 && (
                <p className="text-xs text-muted-foreground">
                  {t("checkoutReturn.stillSyncing")} <button className="underline" onClick={() => navigate("/account")}>{t("checkoutReturn.visitAccount")}</button>
                </p>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

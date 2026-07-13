import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";

export function WhyPaySection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { t } = useTranslation();
  // Pro users get a slimmer, non-salesy layout on the landing page.
  if (isPro) return null;
  const FREE_PERKS = [1, 2, 3, 4].map((n) => t(`landing.whyPay.free${n}`));
  const PRO_PERKS = [1, 2, 3, 4, 5, 6, 7].map((n) => t(`landing.whyPay.pro${n}`));

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">
            <Crown className="h-3 w-3" /> {t("landing.whyPay.badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {t("landing.whyPay.title")}
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            {t("landing.whyPay.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col"
          >
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-lg font-bold">{t("landing.whyPay.free")}</div>
              <div>
                <span className="text-3xl font-heading font-bold">$0</span>
                <span className="text-xs text-muted-foreground font-body ml-1">{t("landing.whyPay.perMonth")}</span>
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
              size="sm"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? t("landing.whyPay.goDashboard") : t("landing.whyPay.startFree")}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 flex flex-col relative"
          >
            <span className="absolute -top-3 right-6 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider">
              {t("landing.whyPay.mostPopular")}
            </span>
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-heading text-lg font-bold text-primary inline-flex items-center gap-1.5">
                <Crown className="h-4 w-4" /> {t("landing.whyPay.pro")}
              </div>
              <div>
                <span className="text-3xl font-heading font-bold">$19</span>
                <span className="text-xs text-muted-foreground font-body ml-1">{t("landing.whyPay.perMonth")}</span>
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
            <Button size="sm" className="shadow-glow" onClick={() => navigate("/pricing")}>
              <Sparkles className="h-3.5 w-3.5" /> {t("landing.whyPay.upgrade")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

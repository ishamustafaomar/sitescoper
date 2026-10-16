import { motion } from "framer-motion";
import { MessageSquareText, FileSearch, Image, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AnalyticsPromoSection() {
  const { t } = useTranslation();
  const points = [
    { icon: FileSearch, title: t("landing.analyticsPromo.p1t"), description: t("landing.analyticsPromo.p1d") },
    { icon: MessageSquareText, title: t("landing.analyticsPromo.p2t"), description: t("landing.analyticsPromo.p2d") },
    { icon: Image, title: t("landing.analyticsPromo.p3t"), description: t("landing.analyticsPromo.p3d") },
  ];
  return (
    <section className="py-12 sm:py-16 px-4 border-y border-border bg-muted/40" aria-labelledby="analytics-promo-heading">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-body text-muted-foreground mb-3">
            <MessageSquareText className="h-3 w-3" />
            {t("landing.analyticsPromo.badge")}
          </div>
          <h2 id="analytics-promo-heading" className="text-3xl md:text-4xl font-heading mb-4">
            {t("landing.analyticsPromo.title")}
          </h2>
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-xl mb-6">
            {t("landing.analyticsPromo.subtitle")}
          </p>
          <Button asChild>
            <Link to="/analytics">
              {t("landing.analyticsPromo.cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
        <div className="grid gap-6">
          {points.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="min-w-0 border-t border-border pt-4"
              >
                <div className="w-fit mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-body font-medium text-base mb-1">{point.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{point.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

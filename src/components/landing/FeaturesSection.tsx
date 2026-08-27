import { motion } from "framer-motion";
import { Sparkles, Search, Layers, Zap, Shield, BarChart3, Globe2, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    { icon: Sparkles, title: t("landing.features.f1t"), description: t("landing.features.f1d") },
    { icon: Layers, title: t("landing.features.f2t"), description: t("landing.features.f2d") },
    { icon: MessageSquareText, title: t("landing.features.f3t"), description: t("landing.features.f3d") },
    { icon: Search, title: t("landing.features.f4t"), description: t("landing.features.f4d") },
    { icon: BarChart3, title: t("landing.features.f5t"), description: t("landing.features.f5d") },
    { icon: Zap, title: t("landing.features.f6t"), description: t("landing.features.f6d") },
    { icon: Shield, title: t("landing.features.f7t"), description: t("landing.features.f7d") },
    { icon: Globe2, title: t("landing.features.f8t"), description: t("landing.features.f8d") },
  ];
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground text-foreground text-[10px] font-body uppercase tracking-[0.18em] font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            {t("landing.features.badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-[var(--shadow-md)] hover:border-primary/30 transition-all"
              >
                <div className="bg-primary p-2 w-fit mb-3">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

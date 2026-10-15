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
    <section className="py-12 sm:py-16 px-4" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 text-xs font-body text-muted-foreground mb-3">
            <Sparkles className="h-3 w-3" />
            {t("landing.features.badge")}
          </div>
          <h2 id="features-heading" className="text-3xl md:text-4xl font-heading mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-2xl">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="min-w-0 border-t border-border pt-4"
              >
                <div className="w-fit mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-body font-medium text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

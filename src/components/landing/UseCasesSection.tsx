import { motion } from "framer-motion";
import { Rocket, Briefcase, ShoppingBag, PenTool, GraduationCap, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function UseCasesSection() {
  const { t } = useTranslation();
  const useCases = [
    { icon: Rocket, title: t("landing.useCases.u1t"), description: t("landing.useCases.u1d") },
    { icon: Briefcase, title: t("landing.useCases.u2t"), description: t("landing.useCases.u2d") },
    { icon: ShoppingBag, title: t("landing.useCases.u3t"), description: t("landing.useCases.u3d") },
    { icon: PenTool, title: t("landing.useCases.u4t"), description: t("landing.useCases.u4d") },
    { icon: GraduationCap, title: t("landing.useCases.u5t"), description: t("landing.useCases.u5d") },
    { icon: Building2, title: t("landing.useCases.u6t"), description: t("landing.useCases.u6d") },
  ];
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground text-foreground text-[10px] font-body uppercase tracking-[0.18em] font-semibold mb-4">
            {t("landing.useCases.badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            {t("landing.useCases.title")}
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            {t("landing.useCases.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-[var(--shadow-md)] transition-all"
              >
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-heading font-semibold text-base mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {uc.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

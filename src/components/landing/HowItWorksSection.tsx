import { motion } from "framer-motion";
import { Link2, Radar, ListChecks, Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = [
    { icon: Link2, number: "01", title: t("landing.howItWorks.s1t"), description: t("landing.howItWorks.s1d") },
    { icon: Radar, number: "02", title: t("landing.howItWorks.s2t"), description: t("landing.howItWorks.s2d") },
    { icon: ListChecks, number: "03", title: t("landing.howItWorks.s3t"), description: t("landing.howItWorks.s3d") },
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
            <Workflow className="h-3 w-3" />
            {t("landing.howItWorks.badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            {t("landing.howItWorks.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary p-2.5">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-heading font-bold text-3xl text-muted-foreground/20">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

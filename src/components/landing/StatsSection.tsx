import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function StatsSection() {
  const { t } = useTranslation();
  const stats = [
    { value: "60s", label: t("landing.stats.s1") },
    { value: "8+", label: t("landing.stats.s2") },
    { value: "6", label: t("landing.stats.s3") },
    { value: "3", label: t("landing.stats.s4") },
  ];
  return (
    <section className="py-16 px-4 border-y border-border bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-heading mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-body">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

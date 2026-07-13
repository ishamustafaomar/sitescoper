import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

export function ManifestoSection() {
  const { t } = useTranslation();
  return (
    <section className="px-4 pt-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl px-8 py-12 md:px-10 md:py-14 text-center border border-primary/20"
          style={{
            background:
              "linear-gradient(160deg, hsl(var(--primary) / 0.08), transparent)",
          }}
        >
          <Quote className="h-7 w-7 mx-auto mb-4 text-primary/50" aria-hidden="true" />
          <p className="font-heading font-semibold text-2xl md:text-3xl leading-snug tracking-tight">
            {t("landing.manifesto.part1")}{" "}
            <span className="text-primary">{t("landing.manifesto.highlight")}</span>{" "}
            {t("landing.manifesto.part2")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
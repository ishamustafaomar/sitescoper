import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/**
 * The hero's evidence panel: a marked-up audit proof sheet. Scores are set as
 * typographic numerals rather than gauges, and findings read as margin notes.
 */
export function HeroPreview() {
  const { t } = useTranslation();

  const findings = [
    { text: t("heroPreview.blockers.hero"), severity: "critical" as const },
    { text: t("heroPreview.blockers.proof"), severity: "warn" as const },
  ];

  const categories = [
    { name: t("heroPreview.categories.copy"), score: 45 },
    { name: t("heroPreview.categories.trust"), score: 62 },
    { name: t("heroPreview.categories.design"), score: 88 },
  ];

  return (
    <div className="border border-foreground bg-card shadow-[var(--shadow-lg)]">
      {/* Sheet header */}
      <div className="flex items-baseline justify-between gap-3 px-5 py-3 border-b border-foreground">
        <span className="font-body text-[10px] uppercase tracking-[0.18em] font-semibold">
          {t("heroPreview.verdictLabel")}
        </span>
        <span className="font-body text-[10px] text-muted-foreground truncate">
          {t("heroPreview.mockUrl")}
        </span>
      </div>

      {/* Score + verdict */}
      <div className="px-5 py-6 flex items-start gap-5 border-b border-border">
        <div className="shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-6xl leading-none"
          >
            72
          </motion.div>
          <div className="font-body text-[9px] uppercase tracking-[0.16em] text-muted-foreground mt-1">
            / 100
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-heading text-xl leading-tight mb-1.5">
            {t("heroPreview.verdictTitle")}
          </p>
          <p className="font-body text-[12px] text-muted-foreground leading-relaxed">
            {t("heroPreview.verdictDescription")}
          </p>
        </div>
      </div>

      {/* Highest-impact findings, as margin notes */}
      <div className="px-5 py-5 border-b border-border space-y-3">
        <div className="font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {t("heroPreview.criticalBlockersLabel")}
        </div>
        {findings.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12 }}
            className={`flex gap-3 pl-3 border-l-2 ${
              f.severity === "critical"
                ? "border-[hsl(var(--accent))]"
                : "border-border"
            }`}
          >
            <span className="font-heading text-sm text-muted-foreground shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-body text-[13px] leading-snug">{f.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Category readout */}
      <div className="px-5 py-4 grid grid-cols-3 divide-x divide-border">
        {categories.map((c) => (
          <div key={c.name} className="px-3 first:pl-0 last:pr-0">
            <div className="font-heading text-2xl leading-none">{c.score}</div>
            <div className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1 truncate">
              {c.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  MousePointerClick,
  ShieldCheck,
  Type,
  Layout,
  Smartphone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A full, realistic sample report shown on the landing page so visitors
 * see exactly what they'll get before pasting their URL. This is the
 * single biggest conversion lever per user feedback.
 */

function levelColor(level: string) {
  if (level === "good") return "hsl(var(--score-good))";
  if (level === "warn") return "hsl(var(--score-warn))";
  return "hsl(var(--score-bad))";
}

export function SampleReportSection({ onTryYours }: { onTryYours: () => void }) {
  const { isPro } = useSubscription();
  const { t } = useTranslation();

  const categories = [
    { icon: Type, key: "copy", score: 42, level: "bad" },
    { icon: Layout, key: "visual", score: 71, level: "warn" },
    { icon: ShieldCheck, key: "trust", score: 58, level: "warn" },
    { icon: MousePointerClick, key: "conversion", score: 49, level: "bad" },
    { icon: Smartphone, key: "mobile", score: 84, level: "good" },
    { icon: Eye, key: "accessibility", score: 76, level: "good" },
  ];
  const findings = [
    { severity: "critical", key: "hero" },
    { severity: "critical", key: "proof" },
    { severity: "warning", key: "pricing" },
    { severity: "warning", key: "ctas" },
  ];
  const verdict = { score: 64 };
  const topWinKeys = ["design", "mobile", "performance"] as const;
  const topRiskKeys = ["hero", "trust", "conversion"] as const;
  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-body font-semibold text-primary uppercase tracking-wider">
              {t("sampleReport.badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            {t("sampleReport.heading")}
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            {t("sampleReport.description")}
          </p>
        </div>

        {/* Report card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-bad))]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-warn))]/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--score-good))]/60" />
            <div className="ml-3 flex-1 max-w-md h-6 rounded-md bg-background/60 flex items-center px-2 gap-1.5">
              <span className="text-[10px] font-body text-muted-foreground truncate">
                {t("sampleReport.mockUrl")}
              </span>
            </div>
            <span className="text-[10px] font-body text-muted-foreground hidden sm:inline">
              {t("sampleReport.generatedTime")}
            </span>
          </div>

          {/* Verdict */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]" aria-hidden="true" focusable="false">
                  <circle cx="60" cy="60" r="52" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="hsl(var(--score-warn))"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 52}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - verdict.score / 100) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-bold text-3xl">{verdict.score}</span>
                  <span className="text-[9px] font-body uppercase tracking-wider text-muted-foreground">
                    /100
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-2">
                  {t("sampleReport.overallVerdictLabel")}
                </div>
                <h3 className="font-heading font-bold text-xl md:text-2xl leading-tight mb-3">
                  {t("sampleReport.verdict.oneLiner")}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {t("sampleReport.verdict.summary")}
                </p>
              </div>
            </div>

            {/* Wins / Risks */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="rounded-lg border border-[hsl(var(--score-good))]/30 bg-[hsl(var(--score-good))]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--score-good))]" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[hsl(var(--score-good))]">
                    {t("sampleReport.whatsWorking")}
                  </span>
                </div>
                <ul className="space-y-2">
                  {topWinKeys.map((k) => (
                    <li key={k} className="text-xs font-body leading-relaxed flex gap-2">
                      <span className="text-[hsl(var(--score-good))] mt-0.5">✓</span>
                      <span>{t(`sampleReport.verdict.wins.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[hsl(var(--score-bad))]/30 bg-[hsl(var(--score-bad))]/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-[hsl(var(--score-bad))]" />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-[hsl(var(--score-bad))]">
                    {t("sampleReport.whatsCosting")}
                  </span>
                </div>
                <ul className="space-y-2">
                  {topRiskKeys.map((k) => (
                    <li key={k} className="text-xs font-body leading-relaxed flex gap-2">
                      <span className="text-[hsl(var(--score-bad))] mt-0.5">✗</span>
                      <span>{t(`sampleReport.verdict.risks.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Category scores */}
          <div className="p-6 md:p-8 border-b border-border">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider">
                {t("sampleReport.scoredDimensions")}
              </h4>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((c, i) => {
                const Icon = c.icon;
                const color = levelColor(c.level);
                return (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <span className="text-xs font-body font-semibold truncate">{t(`sampleReport.categories.${c.key}.name`)}</span>
                      </div>
                      <span
                        className="text-sm font-heading font-bold shrink-0"
                        style={{ color }}
                      >
                        {c.score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body leading-snug">
                      {t(`sampleReport.categories.${c.key}.note`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Detailed findings */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--score-warn))]" />
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider">
                {t("sampleReport.specificFindings")}
              </h4>
            </div>
            <div className="space-y-4">
              {findings.map((f, i) => {
                const isCritical = f.severity === "critical";
                return (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-lg border border-border bg-muted/10 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-2 flex items-center gap-2 border-b border-border ${
                        isCritical
                          ? "bg-[hsl(var(--score-bad))]/10"
                          : "bg-[hsl(var(--score-warn))]/10"
                      }`}
                    >
                      <span
                        className={`text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-[hsl(var(--score-bad))]/20 text-[hsl(var(--score-bad))]"
                            : "bg-[hsl(var(--score-warn))]/20 text-[hsl(var(--score-warn))]"
                        }`}
                      >
                        {t(`sampleReport.severity.${f.severity}`)}
                      </span>
                      <span className="text-[10px] font-body text-muted-foreground truncate">
                        {t(`sampleReport.findings.${f.key}.where`)}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h5 className="font-heading font-bold text-sm leading-snug">{t(`sampleReport.findings.${f.key}.title`)}</h5>
                      <div>
                        <div className="text-[9px] font-body uppercase tracking-wider text-muted-foreground mb-1">
                          {t("sampleReport.whyItMatters")}
                        </div>
                        <p className="text-xs font-body text-foreground/80 leading-relaxed">
                          {t(`sampleReport.findings.${f.key}.why`)}
                        </p>
                      </div>
                      <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                        <div className="text-[9px] font-body uppercase tracking-wider text-primary mb-1 font-bold">
                          {t("sampleReport.recommendedFix")}
                        </div>
                        <p className="text-xs font-body text-foreground/90 leading-relaxed">
                          {t(`sampleReport.findings.${f.key}.fix`)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CTA below sample */}
        <div className="text-center mt-10 space-y-4">
          <p className="text-sm text-muted-foreground font-body">
            {t("sampleReport.footerNote")}
          </p>
          <Button
            size="lg"
            onClick={onTryYours}
            className="shadow-glow bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-body"
          >
            {t("sampleReport.ctaButton")}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground font-body">
            {isPro
              ? t("sampleReport.proNote")
              : t("sampleReport.freeNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
import { motion } from "framer-motion";
import { Globe, Search, Sparkles, FileText, Eye, Brain, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ScanningAnimationProps {
  step: "scraping" | "analyzing";
  url?: string;
}

export function ScanningAnimation({ step, url }: ScanningAnimationProps) {
  const { t } = useTranslation();
  const SCRAPE_STEPS = [
    { icon: Globe, label: t("scanningAnimation.scrape.connecting") },
    { icon: Layers, label: t("scanningAnimation.scrape.discovering") },
    { icon: Eye, label: t("scanningAnimation.scrape.capturing") },
    { icon: FileText, label: t("scanningAnimation.scrape.extracting") },
  ];
  const ANALYZE_STEPS = [
    { icon: Brain, label: t("scanningAnimation.analyze.reading") },
    { icon: Search, label: t("scanningAnimation.analyze.detecting") },
    { icon: Sparkles, label: t("scanningAnimation.analyze.forming") },
    { icon: FileText, label: t("scanningAnimation.analyze.writing") },
  ];
  const steps = step === "scraping" ? SCRAPE_STEPS : ANALYZE_STEPS;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, [step, steps.length]);

  const hostname = (() => {
    try { return url ? new URL(url).hostname : ""; } catch { return url || ""; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-card rounded-3xl border border-border shadow-[var(--shadow-lg)]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.25), transparent 50%), radial-gradient(circle at 70% 70%, hsl(280 70% 60% / 0.2), transparent 50%)",
          }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative p-8 md:p-12 flex flex-col items-center text-center space-y-7">
        {/* Scanner ring */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {/* Outer pulsing rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/40"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
            />
          ))}
          {/* Rotating scan line */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.6) 80deg, transparent 120deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner core */}
          <div className="absolute inset-6 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-[var(--shadow-glow)]">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {step === "scraping" ? (
                <Globe className="h-9 w-9 md:h-11 md:w-11 text-primary" />
              ) : (
                <Sparkles className="h-9 w-9 md:h-11 md:w-11 text-primary" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-1.5 max-w-md">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-primary">
            {step === "scraping" ? t("scanningAnimation.scrape.statusLabel") : t("scanningAnimation.analyze.statusLabel")}
          </p>
          <h3 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            {step === "scraping" ? t("scanningAnimation.scrape.headingPrefix") : t("scanningAnimation.analyze.headingPrefix")}
            <span className="bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
              {hostname || t("scanningAnimation.hostnameFallback")}
            </span>
          </h3>
        </div>

        {/* Step list */}
        <div className="w-full max-w-sm space-y-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <motion.div
                key={s.label}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isDone ? 0.7 : 0.35,
                  x: isActive ? 0 : 0,
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                  isActive
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/50 bg-transparent"
                }`}
              >
                <div
                  className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={`text-sm font-body text-left flex-1 ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {isActive && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        className="h-1 w-1 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, delay: j * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground font-body max-w-sm">
          {step === "scraping"
            ? t("scanningAnimation.scrape.footerNote")
            : t("scanningAnimation.analyze.footerNote")}
        </p>
      </div>
    </motion.div>
  );
}

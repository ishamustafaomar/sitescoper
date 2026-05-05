import { motion } from "framer-motion";
import { Globe, Search, Sparkles, FileText, Eye, Brain, Layers, CheckCircle2, Shield } from "lucide-react";
import type { TechSeoReport } from "@/lib/api";

interface Props {
  step: "scraping" | "analyzing";
  url?: string;
  percent: number;
  label: string;
  techSeo?: TechSeoReport | null;
}

const ICONS = {
  connect: Globe,
  homepage: Eye,
  tech_seo: Shield,
  map: Layers,
  pages: FileText,
  assemble: Sparkles,
  done: CheckCircle2,
};

export function StreamingProgress({ step, url, percent, label, techSeo }: Props) {
  const hostname = (() => {
    try { return url ? new URL(url).hostname : ""; } catch { return url || ""; }
  })();

  const isAnalyze = step === "analyzing";
  const displayPercent = isAnalyze ? Math.min(99, 60 + Math.floor(Math.random() * 40)) : percent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-card rounded-3xl border border-border shadow-[var(--shadow-lg)]"
    >
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.25), transparent 50%), radial-gradient(circle at 70% 70%, hsl(280 70% 60% / 0.2), transparent 50%)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative p-6 md:p-10 flex flex-col items-center text-center space-y-6">
        <div className="relative w-24 h-24 md:w-28 md:h-28">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="absolute inset-0 rounded-full border border-primary/40"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }} />
          ))}
          <motion.div className="absolute inset-2 rounded-full"
            style={{ background: "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.6) 80deg, transparent 120deg)" }}
            animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
          <div className="absolute inset-5 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-[var(--shadow-glow)]">
            {isAnalyze ? <Brain className="h-8 w-8 text-primary" /> : <Globe className="h-8 w-8 text-primary" />}
          </div>
        </div>

        <div className="space-y-1.5 max-w-md">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-primary">
            {isAnalyze ? "AI strategist analyzing" : "Deep crawl in progress"}
          </p>
          <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight">
            {isAnalyze ? "Analyzing " : "Crawling "}
            <span className="bg-gradient-to-r from-primary to-[hsl(280,70%,60%)] bg-clip-text text-transparent">
              {hostname || "your site"}
            </span>
          </h3>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(280,70%,60%)]"
              initial={false}
              animate={{ width: `${displayPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-body text-muted-foreground">
            <span>{label}</span>
            <span className="tabular-nums">{displayPercent}%</span>
          </div>
        </div>

        {/* Tier 1 tech-SEO results revealed live */}
        {techSeo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Tech SEO pre-check
              </div>
              <span className="text-xs font-heading font-semibold tabular-nums">{techSeo.score}/100</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {techSeo.checks.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-[11px] font-body">
                  <span className={c.passed ? "text-[hsl(var(--score-good))]" : "text-[hsl(var(--score-bad))]"}>
                    {c.passed ? "✓" : "✗"}
                  </span>
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-[11px] text-muted-foreground font-body max-w-sm">
          {isAnalyze
            ? "An AI product strategist is reading every page. This is the magic part."
            : "Tier 1: fast technical checks. Tier 2: multi-page crawl. Tier 3: deep AI analysis."}
        </p>
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalysisResult } from "@/lib/api";

interface BenchmarkCardProps {
  analysis: AnalysisResult;
}

export function BenchmarkCard({ analysis }: BenchmarkCardProps) {
  const { t } = useTranslation();
  const pct = analysis.benchmark_percentile;
  if (pct === undefined && !analysis.benchmark_label && !analysis.peer_examples?.length) return null;

  const safePct = Math.max(0, Math.min(100, pct ?? 50));
  const colorClass =
    safePct >= 70 ? "bg-accent" : safePct >= 40 ? "bg-primary" : "bg-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          <h4 className="font-heading font-semibold text-sm">{t("benchmarkCard.title")}</h4>
        </div>
        {pct !== undefined && (
          <span className="text-[11px] font-body text-muted-foreground">
            {t("benchmarkCard.betterThanPrefix")} <span className="font-heading font-bold text-foreground">{safePct}%</span> {t("benchmarkCard.ofPeersSuffix")}
          </span>
        )}
      </div>

      {pct !== undefined && (
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${colorClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${safePct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      {analysis.benchmark_label && (
        <p className="text-xs text-muted-foreground font-body leading-relaxed">{analysis.benchmark_label}</p>
      )}

      {analysis.peer_examples && analysis.peer_examples.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border">
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-body">
            <Users className="h-3 w-3" /> {t("benchmarkCard.compareTo")}
          </span>
          {analysis.peer_examples.slice(0, 4).map((p) => (
            <a
              key={p}
              href={p.startsWith("http") ? p : `https://${p}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-body px-2 py-0.5 rounded-full bg-muted hover:bg-muted/70 transition-colors text-foreground"
            >
              {p.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

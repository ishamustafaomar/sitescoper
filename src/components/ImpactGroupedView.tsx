import { motion } from "framer-motion";
import { useState } from "react";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalysisResult } from "@/lib/api";
import { SuggestionCard } from "@/components/SuggestionCard";
import { flattenSuggestions, rankSuggestions } from "@/components/VerdictCard";
import { Badge } from "@/components/ui/badge";

export function ImpactGroupedView({ analysis }: { analysis: AnalysisResult }) {
  const { t } = useTranslation();
  const groups = [
    { key: "high", label: t("impactGrouped.high"), icon: TrendingUp, accent: "text-destructive", chip: "bg-destructive/10 text-destructive border-destructive/20" },
    { key: "medium", label: t("impactGrouped.medium"), icon: Minus, accent: "text-primary", chip: "bg-primary/10 text-primary border-primary/20" },
    { key: "low", label: t("impactGrouped.low"), icon: TrendingDown, accent: "text-accent", chip: "bg-accent/10 text-accent border-accent/20" },
  ] as const;
  const all = rankSuggestions(flattenSuggestions(analysis));
  const [openKey, setOpenKey] = useState<string>("high");

  const buckets = groups.map((g) => ({
    ...g,
    items: all.filter((s) => (s.priority || "medium") === g.key),
  }));

  return (
    <div className="space-y-3">
      {buckets.map((g, idx) => {
        const Icon = g.icon;
        const isOpen = openKey === g.key;
        return (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => setOpenKey(isOpen ? "" : g.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 ${g.accent}`} />
                <span className="font-heading font-semibold text-sm">{g.label}</span>
                <Badge variant="outline" className={`text-[10px] font-body ${g.chip}`}>
                  {g.items.length}
                </Badge>
              </div>
              <span className="text-[11px] font-body text-muted-foreground">
                {isOpen ? t("impactGrouped.hide") : t("impactGrouped.show")}
              </span>
            </button>
            {isOpen && g.items.length > 0 && (
              <div className="border-t border-border p-3 sm:p-4 space-y-2.5 bg-muted/10">
                {g.items.map((s, i) => (
                  <SuggestionCard
                    key={i}
                    suggestion={s}
                    categoryLabel={(s as any)._category}
                    categoryIcon={(s as any)._icon}
                  />
                ))}
              </div>
            )}
            {isOpen && g.items.length === 0 && (
              <div className="border-t border-border p-6 text-center text-xs font-body text-muted-foreground">
                {t("impactGrouped.empty")}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
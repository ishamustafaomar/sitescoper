import { motion } from "framer-motion";
import { AnalysisResult } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";
import { useState } from "react";

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

function ScoreRing({ score, size = 112 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const color =
    score >= 80 ? "hsl(var(--accent))"
    : score >= 50 ? "hsl(var(--primary))"
    : "hsl(var(--destructive))";
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-2xl font-heading font-bold">{score}</span>
    </div>
  );
}

function MiniScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-accent" : score >= 50 ? "bg-primary" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-heading font-semibold text-muted-foreground">{score}</span>
    </div>
  );
}

const priorityConfig: Record<string, { class: string; icon: typeof TrendingUp }> = {
  high: { class: "bg-destructive/10 text-destructive border-destructive/20", icon: TrendingUp },
  medium: { class: "bg-primary/10 text-primary border-primary/20", icon: Minus },
  low: { class: "bg-accent/10 text-accent border-accent/20", icon: TrendingDown },
};

const typeLabels: Record<string, string> = {
  ux: "UX", content: "Content", seo: "SEO",
  performance: "Perf", accessibility: "A11y", design: "Design",
};

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Score Header */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-6">
          <ScoreRing score={analysis.overall_score} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-heading font-bold">Overall Score</h2>
            <p className="text-muted-foreground font-body text-sm mt-1.5 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>

        {/* Category overview grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          {analysis.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-1">
              <span className="text-xs font-body text-muted-foreground truncate">{cat.icon} {cat.name}</span>
              <MiniScoreBar score={cat.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {analysis.categories.map((category, idx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * idx }}
            className="bg-card rounded-xl border border-border overflow-hidden shadow-[var(--shadow-sm)]"
          >
            <button
              onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-heading font-semibold text-sm">{category.name}</span>
                <Badge variant="secondary" className="text-[10px] font-body">
                  {category.score}/100
                </Badge>
                <Badge variant="outline" className="text-[10px] font-body">
                  {category.suggestions.length} tips
                </Badge>
              </div>
              {expandedCategory === idx ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {expandedCategory === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-2.5">
                  {category.suggestions.map((suggestion, sIdx) => {
                    const config = priorityConfig[suggestion.priority] || priorityConfig.medium;
                    return (
                      <div key={sIdx} className="p-3 rounded-lg bg-muted/30 space-y-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-medium text-sm leading-snug">{suggestion.title}</h4>
                          <div className="flex gap-1 shrink-0">
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${config.class}`}>
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {typeLabels[suggestion.type] || suggestion.type}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-body leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

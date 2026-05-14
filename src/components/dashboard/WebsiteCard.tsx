import { motion } from "framer-motion";
import { Clock, ExternalLink, RefreshCw, Trash2, Loader2, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/Sparkline";
import { TrafficDot, TrafficChip, getTrafficLevel, getTrafficStyles, getTrafficLabel } from "@/components/TrafficLight";
import { cn } from "@/lib/utils";

export interface Website {
  id: string;
  url: string;
  name: string | null;
  last_score: number | null;
  last_analyzed_at: string | null;
  created_at: string;
}

interface WebsiteCardProps {
  website: Website;
  analyzing: boolean;
  onAnalyze: () => void;
  onDelete: () => void;
  onViewSEO: () => void;
  /** Historical scores oldest -> newest (for the trend sparkline) */
  scoreHistory?: number[];
}

function trendDelta(scores?: number[]) {
  if (!scores || scores.length < 2) return null;
  return scores[scores.length - 1] - scores[0];
}

export function WebsiteCard({ website, analyzing, onAnalyze, onDelete, onViewSEO, scoreHistory }: WebsiteCardProps) {
  const delta = trendDelta(scoreHistory);
  const TrendIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta === null ? "text-muted-foreground" : delta > 0 ? "text-accent" : delta < 0 ? "text-destructive" : "text-muted-foreground";
  const level = getTrafficLevel(website.last_score);
  const styles = getTrafficStyles(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative bg-card rounded-2xl border p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all overflow-hidden",
        level === "good" && "border-[hsl(var(--score-good))]/30 hover:border-[hsl(var(--score-good))]/60",
        level === "warn" && "border-[hsl(var(--score-warn))]/30 hover:border-[hsl(var(--score-warn))]/60",
        level === "bad" && "border-[hsl(var(--score-bad))]/30 hover:border-[hsl(var(--score-bad))]/60",
        level === "none" && "border-border hover:border-primary/30",
      )}
    >
      {/* Left status stripe */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.dot)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TrafficDot score={website.last_score} size="md" />
            <h3 className="font-heading font-semibold text-sm truncate">{website.name || website.url}</h3>
          </div>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary font-body truncate flex items-center gap-1 mt-0.5"
          >
            {website.url}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>

          {scoreHistory && scoreHistory.length >= 2 && (
            <div className="flex items-center gap-2 mt-3">
              <Sparkline values={scoreHistory} width={70} height={20} />
              <div className={`flex items-center gap-0.5 text-[10px] font-body ${trendColor}`}>
                <TrendIcon className="h-3 w-3" />
                {delta !== null && (
                  <span className="font-heading font-semibold">
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground/70 font-body">
                {scoreHistory.length} scans
              </span>
            </div>
          )}
        </div>
        {website.last_score !== null ? (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center font-heading font-bold text-xl",
              styles.chip
            )}>
              {website.last_score}
            </div>
            <span className={cn("text-[9px] font-body uppercase tracking-wider", styles.text)}>
              {getTrafficLabel(level)}
            </span>
          </div>
        ) : (
          <TrafficChip score={null} showScore={false} />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
          <Clock className="h-3 w-3" />
          {website.last_analyzed_at
            ? new Date(website.last_analyzed_at).toLocaleDateString()
            : "Not analyzed yet"}
        </div>
        <div className="flex gap-1.5">
          {website.last_score !== null && (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onViewSEO}>
              <Eye className="h-3 w-3" />
              SEO
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={onAnalyze}
            disabled={analyzing}
          >
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Analyze
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label={`Delete ${website.name || website.url}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

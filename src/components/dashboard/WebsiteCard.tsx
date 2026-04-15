import { motion } from "framer-motion";
import { Clock, ExternalLink, RefreshCw, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";

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
}

export function WebsiteCard({ website, analyzing, onAnalyze, onDelete, onViewSEO }: WebsiteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-sm truncate">{website.name || website.url}</h3>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary font-body truncate flex items-center gap-1 mt-0.5"
          >
            {website.url}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
        {website.last_score !== null && <ScoreRing score={website.last_score} size={48} />}
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
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

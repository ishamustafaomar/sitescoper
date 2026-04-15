import { motion } from "framer-motion";
import { ScrapeResult } from "@/lib/api";

interface WebsitePreviewProps {
  data: ScrapeResult;
  url: string;
}

export function WebsitePreview({ data, url }: WebsitePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-accent/60" />
          <div className="w-3 h-3 rounded-full bg-primary/40" />
        </div>
        <span className="text-xs text-muted-foreground font-body truncate ml-2">{url}</span>
      </div>
      <div className="max-h-[400px] overflow-auto">
        {data.screenshot ? (
          <img
            src={`data:image/png;base64,${data.screenshot}`}
            alt={`Screenshot of ${url}`}
            className="w-full"
          />
        ) : (
          <div className="p-6 text-muted-foreground text-sm font-body">
            No screenshot available
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrapeResult } from "@/lib/api";
import { ImageOff } from "lucide-react";

interface WebsitePreviewProps {
  data: ScrapeResult;
  url: string;
}

export function WebsitePreview({ data, url }: WebsitePreviewProps) {
  const [imgError, setImgError] = useState(false);

  // Screenshot can be a URL or base64 string
  const screenshotSrc = data.screenshot
    ? data.screenshot.startsWith("http")
      ? data.screenshot
      : `data:image/png;base64,${data.screenshot}`
    : null;

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
          <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,55%)]/60" />
          <div className="w-3 h-3 rounded-full bg-accent/60" />
        </div>
        <span className="text-xs text-muted-foreground font-body truncate ml-2">{url}</span>
      </div>
      <div className="max-h-[400px] overflow-auto bg-muted/20">
        {screenshotSrc && !imgError ? (
          <img
            src={screenshotSrc}
            alt={`Screenshot of ${url}`}
            className="w-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
            <ImageOff className="h-8 w-8 opacity-40" />
            <span className="text-sm font-body">No screenshot available</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

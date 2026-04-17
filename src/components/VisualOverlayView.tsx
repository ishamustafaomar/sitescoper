import { motion } from "framer-motion";
import { ScrapeResult, AnalysisResult } from "@/lib/api";
import { Image as ImageIcon, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";

interface VisualOverlayViewProps {
  scrapeData: ScrapeResult;
  analysis: AnalysisResult;
}

export function VisualOverlayView({ scrapeData, analysis }: VisualOverlayViewProps) {
  const [imgError, setImgError] = useState(false);
  const screenshot = scrapeData.screenshot;
  const screenshotSrc = screenshot
    ? screenshot.startsWith("data:") || screenshot.startsWith("http")
      ? screenshot
      : `data:image/png;base64,${screenshot}`
    : null;

  // Map suggestions by src for quick lookup
  const suggestionsBySrc = useMemo(() => {
    const map = new Map<string, NonNullable<AnalysisResult["image_suggestions"]>[number]>();
    (analysis.image_suggestions || []).forEach((s) => map.set(s.src, s));
    return map;
  }, [analysis.image_suggestions]);

  const allImages = scrapeData.images || [];
  const flaggedCount = analysis.image_suggestions?.length ?? 0;
  const okCount = Math.max(allImages.length - flaggedCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Summary header */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-body">
        <Badge variant="outline" className="gap-1">
          <ImageIcon className="h-3 w-3" />
          {allImages.length} images on homepage
        </Badge>
        {flaggedCount > 0 && (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            {flaggedCount} need better alt text
          </Badge>
        )}
        {okCount > 0 && (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {okCount} look fine
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: screenshot */}
        <div className="lg:sticky lg:top-4 self-start">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-accent/40" />
              <span className="text-xs font-body text-muted-foreground ml-2 truncate">
                {scrapeData.metadata?.title || "Homepage"}
              </span>
            </div>
            <div className="bg-muted/20 max-h-[600px] overflow-y-auto">
              {screenshotSrc && !imgError ? (
                <img
                  src={screenshotSrc}
                  alt="Website screenshot"
                  className="w-full h-auto block"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-muted-foreground text-sm font-body">
                  Screenshot unavailable
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: image suggestions list */}
        <div className="space-y-3">
          {allImages.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-body text-muted-foreground">
                No images detected on the homepage.
              </p>
            </div>
          )}

          {allImages.map((img, idx) => {
            const suggestion = suggestionsBySrc.get(img.src);
            const flagged = !!suggestion;
            const filename = (() => {
              try { return new URL(img.src).pathname.split("/").pop() || img.src; } catch { return img.src; }
            })();

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl border p-3 ${
                  flagged
                    ? "bg-destructive/5 border-destructive/20"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
                    <img
                      src={img.src}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-body text-muted-foreground truncate" title={img.src}>
                        {filename}
                      </p>
                      {flagged ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] px-1.5 shrink-0">
                          {suggestion!.issue}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[9px] px-1.5 shrink-0 gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          OK
                        </Badge>
                      )}
                    </div>

                    {flagged ? (
                      <div className="space-y-1">
                        <div className="text-xs font-body">
                          <span className="text-muted-foreground">Current: </span>
                          <span className="text-foreground/80 italic">
                            {img.alt ? `"${img.alt}"` : "(empty)"}
                          </span>
                        </div>
                        <div className="text-xs font-body flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
                          <span className="text-foreground font-medium">"{suggestion!.suggested_alt}"</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-body text-muted-foreground">
                        Alt: <span className="text-foreground/80">"{img.alt || "(empty, likely decorative)"}"</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

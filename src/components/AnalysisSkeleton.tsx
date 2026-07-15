import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AnalysisSkeletonProps {
  step: "scraping" | "analyzing";
}

export function AnalysisSkeleton({ step }: AnalysisSkeletonProps) {
  const { t } = useTranslation();
  const copy = step === "scraping"
    ? { title: t("analysisSkeleton.scraping.title"), sub: t("analysisSkeleton.scraping.sub") }
    : { title: t("analysisSkeleton.analyzing.title"), sub: t("analysisSkeleton.analyzing.sub") };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Status banner */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-heading font-semibold text-primary">{copy.title}</p>
          <p className="text-xs text-muted-foreground font-body">{copy.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Website Preview skeleton */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5" />
            {t("analysisSkeleton.websitePreviewHeading")}
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <Skeleton className="h-4 flex-1 ml-3 rounded-full" />
            </div>
            <Skeleton className="aspect-video w-full rounded-none" />
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        {/* Right: AI Analysis skeleton */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            {t("analysisSkeleton.aiAnalysisHeading")}
          </h3>
          {/* Score header skeleton */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-md)] space-y-5">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          {/* Category list skeletons */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] flex items-center gap-3"
              >
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 flex-1 max-w-[180px]" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrapeResult } from "@/lib/api";
import { ImageOff, Globe, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WebsitePreviewProps {
  data: ScrapeResult;
  url: string;
}

export function WebsitePreview({ data, url }: WebsitePreviewProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const screenshotSrc = data.screenshot
    ? data.screenshot.startsWith("http")
      ? data.screenshot
      : `data:image/png;base64,${data.screenshot}`
    : null;

  return (
    <div className="space-y-3">
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
        <div className="max-h-[400px] overflow-auto bg-muted/20 aspect-video">
          {screenshotSrc && !imgError ? (
            <img
              src={screenshotSrc}
              alt={`Screenshot of ${url}`}
              className="w-full"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
              <ImageOff className="h-8 w-8 opacity-40" />
              <span className="text-sm font-body">{t("websitePreview.noScreenshot")}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pages crawled */}
      {data.pages && data.pages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-sm)] space-y-2.5"
        >
          <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {t("websitePreview.pagesCrawled")}
            <span className="text-xs text-muted-foreground font-body font-normal">
              ({data.pages.length} {t("websitePreview.ofDiscovered", { total: data.siteUrlsDiscovered || "?" })})
            </span>
          </h4>
          <ul className="space-y-1">
            {data.pages.map((page, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-body">
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                  title={page.url}
                >
                  {page.title || new URL(page.url).pathname}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

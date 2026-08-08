import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImageSuggestion { src: string; current_alt: string; suggested_alt: string; issue: string }
interface Props { images?: any[]; suggestions?: ImageSuggestion[] }

export function ImageAuditPanel({ images = [], suggestions = [] }: Props) {
  const total = images.length;
  const missingAlt = images.filter((i: any) => !i.alt || i.alt.trim() === "").length;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" /> Image audit
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-body">
          <Badge variant="secondary">{total} total</Badge>
          <Badge variant={missingAlt > 0 ? "destructive" : "secondary"}>{missingAlt} missing alt</Badge>
        </div>
      </div>
      {suggestions.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {suggestions.slice(0, 8).map((s, i) => (
            <div key={i} className="flex gap-3 p-2 rounded-lg bg-muted/30">
              <img src={s.src} alt={s.current_alt || ""} className="h-12 w-12 rounded object-cover shrink-0 bg-muted" loading="lazy" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[11px] text-destructive font-body">{s.issue}</p>
                <p className="text-xs font-heading font-medium truncate">→ {s.suggested_alt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-body text-center py-3">
          {total === 0 ? "No images detected on the page." : "All images look properly described."}
        </p>
      )}
    </div>
  );
}
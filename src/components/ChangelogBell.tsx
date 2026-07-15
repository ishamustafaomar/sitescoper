import { useEffect, useState } from "react";
import { Bell, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHANGELOG, LATEST_CHANGELOG_ID } from "@/data/changelog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sitescoper.lastSeenChangelogId";

export function ChangelogBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(STORAGE_KEY));
    } catch {
      // ignore
    }
  }, []);

  const hasUnread = LATEST_CHANGELOG_ID && lastSeen !== LATEST_CHANGELOG_ID;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && LATEST_CHANGELOG_ID) {
      try {
        localStorage.setItem(STORAGE_KEY, LATEST_CHANGELOG_ID);
      } catch {
        // ignore
      }
      setLastSeen(LATEST_CHANGELOG_ID);
    }
  };

  const dateFormatter = new Intl.DateTimeFormat(i18n.resolvedLanguage || "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={t("changelog.title", { defaultValue: "What's new" })}
        >
          <Bell className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="font-heading text-sm font-semibold">
            {t("changelog.title", { defaultValue: "What's new" })}
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {CHANGELOG.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              {t("changelog.empty", { defaultValue: "No updates yet." })}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {CHANGELOG.map((entry, idx) => (
                <li key={entry.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    {idx === 0 && (
                      <span className="rounded-full bg-primary/10 text-primary text-[9px] font-bold tracking-wider px-1.5 py-[1px] border border-primary/25">
                        {t("changelog.newBadge", { defaultValue: "NEW" })}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {dateFormatter.format(new Date(entry.date))}
                    </span>
                  </div>
                  <div className={cn("font-heading text-sm font-semibold mb-1")}>
                    {t(entry.titleKey)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(entry.descKey)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
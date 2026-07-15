import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { SeoCheck } from "@/lib/seoAudit";
import { useTranslation } from "react-i18next";

export function CheckRow({ check }: { check: SeoCheck }) {
  const { t } = useTranslation();
  const Icon = check.status === "pass" ? CheckCircle2 : check.status === "warn" ? AlertTriangle : XCircle;
  const tone =
    check.status === "pass"
      ? "text-accent"
      : check.status === "warn"
      ? "text-primary"
      : "text-destructive";
  return (
    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone}`} />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-medium text-sm">{check.name}</p>
          <p className="text-xs text-muted-foreground font-body break-words">{check.detail}</p>
          {check.fix && check.status !== "pass" && (
            <p className="text-xs font-body text-foreground/80 mt-1">
              <span className="font-medium">{t("seoAudit.fixLabel")} </span>{check.fix}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
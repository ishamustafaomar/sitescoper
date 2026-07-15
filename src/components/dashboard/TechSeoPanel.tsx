import { CheckCircle2, XCircle, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Check { name: string; passed: boolean; detail: string }
interface Props { report?: { score: number; checks: Check[] } | null }

export function TechSeoPanel({ report }: Props) {
  const { t } = useTranslation();
  if (!report || !report.checks?.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" /> {t("techSeo.title")}
        </h3>
        <p className="text-xs text-muted-foreground font-body">{t("techSeo.rescanToPopulate")}</p>
      </div>
    );
  }
  const passed = report.checks.filter((c) => c.passed).length;
  const total = report.checks.length;
  const score = report.score;
  const scoreColor = score >= 80 ? "text-accent" : score >= 50 ? "text-primary" : "text-destructive";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> {t("techSeo.healthTitle")}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground font-body">{passed}/{total} {t("techSeo.passingLabel")}</span>
          <span className={`font-heading font-bold text-xl ${scoreColor}`}>{score}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {report.checks.map((c) => (
          <div key={c.name} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            {c.passed ? (
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-heading font-medium">{c.name}</p>
              <p className="text-[11px] text-muted-foreground font-body truncate">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
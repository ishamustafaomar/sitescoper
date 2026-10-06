import { useState } from "react";
import { Target, Sparkles, AlertTriangle, ChevronDown, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AnalysisResult, AnalysisCategory } from "@/lib/api";
import { cn } from "@/lib/utils";

export const catKey = (n: string) =>
  n.toLowerCase().replace(/&|and|the|mechanics/g, " ").replace(/[^a-z ]/g, " ").trim().split(/\s+/)[0] ?? n;

interface Row { key: string; name: string; icon?: string; a?: AnalysisCategory; b?: AnalysisCategory }

function buildRows(a: AnalysisResult, b: AnalysisResult): Row[] {
  const m = new Map<string, Row>();
  a.categories.forEach((c) => m.set(catKey(c.name), { key: catKey(c.name), name: c.name, icon: c.icon, a: c }));
  b.categories.forEach((c) => {
    const k = catKey(c.name);
    const p = m.get(k);
    m.set(k, { key: k, name: p?.name ?? c.name, icon: p?.icon ?? c.icon, a: p?.a, b: c });
  });
  return Array.from(m.values());
}

const countPri = (r: AnalysisResult) => {
  const out = { high: 0, medium: 0, low: 0 };
  r.categories.forEach((c) => c.suggestions?.forEach((s) => { out[s.priority || "medium"]++; }));
  return out;
};

export function CompareInsights({ a, b, nameA, nameB }: { a: AnalysisResult; b: AnalysisResult; nameA: string; nameB: string }) {
  const { t } = useTranslation();
  const rows = buildRows(a, b);
  const both = rows.filter((r) => r.a && r.b);
  const losing = both.filter((r) => r.b!.score > r.a!.score).sort((x, y) => (y.b!.score - y.a!.score) - (x.b!.score - x.a!.score));
  const winning = both.filter((r) => r.a!.score > r.b!.score).sort((x, y) => (y.a!.score - y.b!.score) - (x.a!.score - x.b!.score));
  const shared = both.filter((r) => r.a!.score < 65 && r.b!.score < 65);
  const gap = b.overall_score - a.overall_score;
  const pa = countPri(a), pb = countPri(b);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Overtake plan */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">
            {gap > 0 ? t("compare.insights.overtakeTitle", { name: nameA, gap }) : t("compare.insights.defendTitle", { name: nameA })}
          </h3>
        </div>
        {losing.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body">{t("compare.insights.noLosses")}</p>
        ) : (
          <ol className="space-y-2">
            {losing.slice(0, 4).map((r, i) => {
              const fix = [...(r.a!.suggestions || [])].sort((x, y) => (x.priority === "high" ? -1 : 0) - (y.priority === "high" ? -1 : 0))[0];
              return (
                <li key={r.key} className="flex gap-3 text-sm font-body">
                  <span className="font-heading font-bold text-primary w-5 shrink-0">{i + 1}.</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{r.icon} {r.name} <span className="text-destructive text-xs">−{r.b!.score - r.a!.score}</span></p>
                    {fix && <p className="text-muted-foreground text-xs mt-0.5">{fix.title}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Steal this */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">{t("compare.insights.stealTitle", { name: nameB })}</h3>
          </div>
          {losing.length === 0 ? (
            <p className="text-xs text-muted-foreground font-body">{t("compare.insights.nothingToSteal")}</p>
          ) : losing.slice(0, 4).map((r) => (
            <p key={r.key} className="text-xs font-body">
              <span className="font-semibold">{r.name}:</span>{" "}
              <span className="text-muted-foreground">
                {t("compare.insights.stealLine", { name: nameB, a: r.b!.suggestions?.length ?? 0, b: r.a!.suggestions?.length ?? 0 })}
              </span>
            </p>
          ))}
          {winning.length > 0 && (
            <p className="text-xs font-body pt-2 border-t border-border mt-2">
              <span className="font-semibold">{t("compare.insights.yourEdge")}</span>{" "}
              <span className="text-muted-foreground">{winning.slice(0, 3).map((r) => r.name).join(", ")}</span>
            </p>
          )}
        </div>

        {/* Shared blind spots + issue load */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">{t("compare.insights.sharedTitle")}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            {shared.length ? t("compare.insights.sharedDesc") : t("compare.insights.sharedNone")}
          </p>
          {shared.map((r) => (
            <p key={r.key} className="text-xs font-body font-semibold">{r.icon} {r.name} <span className="text-muted-foreground font-normal">({r.a!.score} / {r.b!.score})</span></p>
          ))}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">{t("compare.insights.issueLoad")}</span>
            </div>
            {[{ n: nameA, p: pa }, { n: nameB, p: pb }].map((s) => (
              <p key={s.n} className="text-xs font-body flex justify-between gap-2">
                <span className="truncate">{s.n}</span>
                <span className="tabular-nums"><span className="text-destructive">{s.p.high}</span> · {s.p.medium} · <span className="text-muted-foreground">{s.p.low}</span></span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-down */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm">{t("compare.insights.drillTitle")}</h3>
        </div>
        <div className="divide-y divide-border">
          {both.map((r) => {
            const isOpen = open === r.key;
            const subs = new Map<string, { a?: number; b?: number }>();
            r.a!.sub_scores?.forEach((s) => subs.set(s.name, { a: s.score }));
            r.b!.sub_scores?.forEach((s) => subs.set(s.name, { ...subs.get(s.name), b: s.score }));
            return (
              <div key={r.key}>
                <button onClick={() => setOpen(isOpen ? null : r.key)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 text-left">
                  <span className="text-sm font-heading font-semibold">{r.icon} {r.name}</span>
                  <span className="flex items-center gap-3 text-xs font-body tabular-nums">
                    {r.a!.score} – {r.b!.score}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 space-y-3">
                    {subs.size > 0 && (
                      <div className="space-y-1">
                        {Array.from(subs.entries()).map(([n, v]) => (
                          <p key={n} className="text-xs font-body flex justify-between">
                            <span className="text-muted-foreground">{n}</span>
                            <span className="tabular-nums">{v.a ?? "—"} – {v.b ?? "—"}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-3">
                      {[{ n: nameA, c: r.a! }, { n: nameB, c: r.b! }].map((s) => (
                        <div key={s.n} className="rounded-lg bg-muted/30 p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1.5">{s.n}</p>
                          <ul className="space-y-1">
                            {(s.c.suggestions || []).slice(0, 3).map((sg, i) => (
                              <li key={i} className="text-xs font-body">• {sg.title}</li>
                            ))}
                            {!s.c.suggestions?.length && <li className="text-xs text-muted-foreground">{t("compare.insights.noIssues")}</li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

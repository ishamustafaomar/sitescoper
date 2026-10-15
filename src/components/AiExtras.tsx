import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search, Film, ExternalLink, Download } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { competitorIntel, startVideoRoast, checkVideoRoast, quickPreview, type CompetitorIntel, type QuickPreview } from "@/lib/ai-extras.functions";
import type { AnalysisResult } from "@/lib/api";

const errMsg = (e: unknown, fallback: string) => {
  const m = e instanceof Error ? e.message : "";
  if (/unauthor/i.test(m)) return fallback;
  return m || fallback;
};

export function CompetitorIntelPanel({ url, analysis }: { url: string; analysis: AnalysisResult }) {
  const { t } = useTranslation();
  const run = useServerFn(competitorIntel);
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<CompetitorIntel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await run({ data: { url, summary: analysis.summary, category: analysis.site_category } });
      if (r.ok) setIntel(r.intel);
      else setError(r.error);
    } catch (e) {
      setError(errMsg(e, t("aiExtras.proOnly")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-heading font-bold text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" />{t("aiExtras.intelTitle")}</h3>
          <p className="text-xs text-muted-foreground font-body mt-1 max-w-md">{t("aiExtras.intelDesc")}</p>
        </div>
        {!intel && (
          <Button size="sm" variant="hero" onClick={go} disabled={loading || !url}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? t("aiExtras.researching") : t("aiExtras.intelRun")}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive font-body">{error}</p>}
      {intel && (
        <div className="space-y-3">
          {intel.competitors.map((c) => (
            <div key={c.url + c.name} className="rounded-xl border border-border p-3 space-y-1">
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-heading font-semibold text-sm hover:underline">{c.name}</a>
              <p className="text-sm font-body"><span className="text-muted-foreground">{t("aiExtras.doingWell")}:</span> {c.doing_well}</p>
              <p className="text-sm font-body"><span className="text-muted-foreground">{t("aiExtras.stealThis")}:</span> {c.you_can_steal}</p>
              <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline">
                {t("aiExtras.source")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
          {intel.takeaway && <p className="text-sm font-body font-medium">{intel.takeaway}</p>}
          <p className="text-xs text-muted-foreground font-body">
            {t("aiExtras.intelFootnote", { date: new Date(intel.generated_at).toLocaleDateString() })}
          </p>
        </div>
      )}
    </div>
  );
}

export function VideoRoastPanel({ url, analysis }: { url: string; analysis: AnalysisResult }) {
  const { t } = useTranslation();
  const start = useServerFn(startVideoRoast);
  const check = useServerFn(checkVideoRoast);
  const [id, setId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id || videoUrl) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await check({ data: { id } });
        if (cancelled) return;
        if (r.status === "completed" && r.url) { setVideoUrl(r.url); setBusy(false); return; }
        if (r.status === "failed") { setError(r.error ?? t("aiExtras.videoFailed")); setBusy(false); return; }
        setProgress(r.progress);
      } catch { /* keep polling */ }
      timer.current = setTimeout(poll, 7000);
    };
    timer.current = setTimeout(poll, 7000);
    return () => { cancelled = true; if (timer.current) clearTimeout(timer.current); };
  }, [id, videoUrl, check, t]);

  const go = async () => {
    setBusy(true);
    setError(null);
    const issues = analysis.categories
      .flatMap((c) => c.suggestions)
      .sort((a, b) => (a.priority === "high" ? -1 : 0) - (b.priority === "high" ? -1 : 0))
      .slice(0, 3)
      .map((s) => s.title);
    try {
      const r = await start({ data: { url, score: analysis.overall_score, issues } });
      if (r.ok) setId(r.id);
      else { setError(r.error); setBusy(false); }
    } catch (e) {
      setError(errMsg(e, t("aiExtras.videoProOnly")));
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-heading font-bold text-base flex items-center gap-2"><Film className="h-4 w-4 text-primary" />{t("aiExtras.videoTitle")}</h3>
          <p className="text-xs text-muted-foreground font-body mt-1 max-w-md">{t("aiExtras.videoDesc")}</p>
        </div>
        {!videoUrl && (
          <Button size="sm" variant="hero" onClick={go} disabled={busy || !url}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
            {busy ? t("aiExtras.videoMaking", { progress: progress ?? 0 }) : t("aiExtras.videoRun")}
          </Button>
        )}
      </div>
      {busy && <p className="text-xs text-muted-foreground font-body">{t("aiExtras.videoWait")}</p>}
      {error && <p className="text-sm text-destructive font-body">{error}</p>}
      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls playsInline className="w-full max-w-[280px] rounded-xl border border-border" />
          <Button asChild size="sm" variant="outline">
            <a href={videoUrl} download="sitescoper-roast.mp4"><Download className="h-4 w-4" />{t("aiExtras.download")}</a>
          </Button>
        </div>
      )}
    </div>
  );
}

export function QuickPreviewCard({ url }: { url: string }) {
  const { t } = useTranslation();
  const run = useServerFn(quickPreview);
  const [preview, setPreview] = useState<QuickPreview | null>(null);
  useEffect(() => {
    let alive = true;
    setPreview(null);
    if (!url) return;
    run({ data: { url } }).then((r) => { if (alive && r.ok) setPreview(r.preview); }).catch(() => {});
    return () => { alive = false; };
  }, [url, run]);
  if (!preview) return null;
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-4 space-y-2 max-w-md mx-auto">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-body">{t("aiExtras.previewLabel")}</span>
        <span className="font-heading font-bold text-2xl">~{preview.score}</span>
      </div>
      <ul className="space-y-1">
        {preview.flags.map((f) => (
          <li key={f.key} className="text-sm font-body flex gap-2">
            <span className={f.ok ? "text-accent" : "text-destructive"}>{f.ok ? "✓" : "✗"}</span>
            {t(`aiExtras.flag_${f.key}`)}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground font-body">{t("aiExtras.previewNote")}</p>
    </div>
  );
}

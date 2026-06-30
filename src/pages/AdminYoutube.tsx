import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Download, RefreshCcw, Sparkles, CheckCircle2 } from "lucide-react";
// @ts-ignore - no types
import fixWebmDuration from "fix-webm-duration";

type Caption = { text: string; start_ms: number; end_ms: number };
type Short = {
  id: string;
  generated_at: string;
  format: string;
  insight: string;
  title: string;
  description: string;
  tags: string[];
  captions: Caption[];
  bg_color: string;
  accent_color: string;
  status: string;
  posted_at: string | null;
  utm_campaign: string;
};

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

function drawFrame(
  ctx: CanvasRenderingContext2D,
  short: Short,
  tMs: number,
  totalMs: number,
) {
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(0, short.bg_color);
  grad.addColorStop(1, "#000000");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle moving accent blob
  const t = tMs / totalMs;
  const cx = WIDTH * (0.3 + 0.4 * Math.sin(t * Math.PI * 2));
  const cy = HEIGHT * (0.25 + 0.1 * Math.cos(t * Math.PI * 2));
  const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700);
  radial.addColorStop(0, short.accent_color + "55");
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Top brand strip
  ctx.fillStyle = short.accent_color;
  ctx.fillRect(0, 0, WIDTH, 12);

  // Brand label
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 44px ui-sans-serif, system-ui, -apple-system, Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SiteScoper", WIDTH / 2, 120);

  // Current caption
  const cap = short.captions.find((c) => tMs >= c.start_ms && tMs < c.end_ms);
  if (cap) {
    const localT = (tMs - cap.start_ms) / Math.max(1, cap.end_ms - cap.start_ms);
    const pop = Math.min(1, localT * 8); // quick scale-in
    const scale = 0.92 + 0.08 * pop;
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 130px ui-sans-serif, system-ui, -apple-system, Inter, sans-serif";
    // Wrap to ~14 chars/line
    const words = cap.text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (test.length > 14 && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    const lh = 150;
    const offset = -((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => {
      // accent underline-ish glow
      ctx.shadowColor = short.accent_color;
      ctx.shadowBlur = 24;
      ctx.fillText(l.toUpperCase(), 0, offset + i * lh);
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Progress bar
  ctx.fillStyle = "#FFFFFF22";
  ctx.fillRect(80, HEIGHT - 90, WIDTH - 160, 10);
  ctx.fillStyle = short.accent_color;
  ctx.fillRect(80, HEIGHT - 90, (WIDTH - 160) * t, 10);

  // Footer
  ctx.fillStyle = "#FFFFFFCC";
  ctx.textAlign = "center";
  ctx.font = "500 38px ui-sans-serif, system-ui, Inter, sans-serif";
  ctx.fillText("sitescoper.com  ·  free", WIDTH / 2, HEIGHT - 130);
}

async function renderShortToBlob(short: Short, setProgress: (p: number) => void): Promise<Blob> {
  const totalMs = Math.max(...short.captions.map((c) => c.end_ms), 15000);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Pick best supported codec
  const mimeCandidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";
  // @ts-ignore
  const stream = canvas.captureStream(FPS);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  rec.start(100);
  const start = performance.now();

  await new Promise<void>((resolve) => {
    function tick() {
      const elapsed = performance.now() - start;
      if (elapsed >= totalMs) { resolve(); return; }
      drawFrame(ctx, short, elapsed, totalMs);
      setProgress(Math.min(1, elapsed / totalMs));
      requestAnimationFrame(tick);
    }
    tick();
  });

  rec.stop();
  const raw = await done;
  try {
    return await new Promise<Blob>((resolve) => {
      fixWebmDuration(raw, totalMs, (fixed: Blob) => resolve(fixed));
    });
  } catch {
    return raw;
  }
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast({ title: `${label} copied` });
}

function CardShort({ short, onChanged }: { short: Short; onChanged: () => void }) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);

  // Animated preview loop
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const totalMs = Math.max(...short.captions.map((c) => c.end_ms), 15000);
    const start = performance.now();
    function tick() {
      const t = (performance.now() - start) % totalMs;
      drawFrame(ctx, short, t, totalMs);
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [short]);

  const download = async () => {
    setRendering(true);
    setProgress(0);
    try {
      const blob = await renderShortToBlob(short, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sitescoper-short-${short.id.slice(0, 8)}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Upload as a YouTube Short. Vertical 1080x1920." });
    } catch (e: any) {
      toast({ title: "Render failed", description: e.message, variant: "destructive" });
    } finally {
      setRendering(false);
    }
  };

  const regenerate = async () => {
    const { error } = await supabase.functions.invoke("youtube-short-generate");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "New Short generated" });
    onChanged();
  };

  const markPosted = async () => {
    const next = short.status === "posted" ? "generated" : "posted";
    const { error } = await supabase
      .from("youtube_shorts")
      .update({ status: next, posted_at: next === "posted" ? new Date().toISOString() : null })
      .eq("id", short.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    onChanged();
  };

  return (
    <Card className="p-6 grid md:grid-cols-[270px_1fr] gap-6">
      <div>
        <canvas
          ref={previewRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full rounded-lg border border-border"
          style={{ aspectRatio: "9/16" }}
        />
      </div>
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{short.format}</Badge>
          <Badge variant={short.status === "posted" ? "default" : "secondary"}>
            {short.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(short.generated_at).toLocaleString()}
          </span>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground mb-1">Insight</div>
          <p className="text-sm">{short.insight}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">Title ({short.title.length})</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.title, "Title")}>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>
          <p className="font-medium">{short.title}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">Description</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.description, "Description")}>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>
          <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded">{short.description}</pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">Tags</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.tags.join(", "), "Tags")}>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{short.tags.join(", ")}</p>
        </div>

        <div className="flex gap-2 flex-wrap pt-2">
          <Button onClick={download} disabled={rendering}>
            {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {rendering ? `Rendering ${Math.round(progress * 100)}%` : "Download MP4"}
          </Button>
          <Button variant="outline" onClick={regenerate}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
          <Button variant="secondary" onClick={markPosted}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {short.status === "posted" ? "Mark as not posted" : "Mark as posted"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function AdminYoutube() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("youtube_shorts")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(30);
    setShorts(((data || []) as unknown) as Short[]);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const generateNow = async () => {
    setGenerating(true);
    const { error } = await supabase.functions.invoke("youtube-short-generate");
    setGenerating(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "New Short generated" });
    load();
  };

  if (roleLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <div className="p-8">Admin only.</div>;

  const today = shorts[0];
  const rest = shorts.slice(1);

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">YouTube Shorts</h1>
          <p className="text-sm text-muted-foreground">
            One Short generated daily at 13:00 UTC. Copy text, download MP4, post yourself.
          </p>
        </div>
        <Button onClick={generateNow} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate now
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>
      ) : !today ? (
        <Card className="p-12 text-center text-muted-foreground">
          No Shorts yet. Click <strong>Generate now</strong> to create your first one.
        </Card>
      ) : (
        <>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">Today</h2>
          <CardShort short={today} onChanged={load} />
          {rest.length > 0 && (
            <>
              <h2 className="text-sm font-semibold uppercase text-muted-foreground pt-6">History</h2>
              <div className="space-y-4">
                {rest.map((s) => <CardShort key={s.id} short={s} onChanged={load} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
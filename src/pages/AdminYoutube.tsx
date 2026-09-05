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
import { useTranslation } from "react-i18next";

type Beat = { text: string; screenshot_index: number; visual_note: string };
type WordTiming = { word: string; start_ms: number; end_ms: number };
type Short = {
  id: string;
  generated_at: string;
  format: string;
  insight: string;
  target_site: string | null;
  title: string;
  description: string;
  tags: string[];
  captions: Beat[];
  caption_timings: WordTiming[];
  screenshot_urls: string[];
  script: string | null;
  voice_url: string | null;
  duration_ms: number | null;
  hook?: string;
  bg_color: string;
  accent_color: string;
  status: string;
  posted_at: string | null;
  utm_campaign: string;
};

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const END_CARD_MS = 2000;

// Get signed URL for a storage path
async function signedUrl(path: string): Promise<string> {
  const { data } = await supabase.storage.from("youtube-shorts").createSignedUrl(path, 60 * 60);
  return data?.signedUrl || "";
}

// Draw one frame: Ken-Burns'd screenshot + word-by-word caption or end card.
function drawFrame(
  ctx: CanvasRenderingContext2D,
  short: Short,
  images: (HTMLImageElement | null)[],
  tMs: number,
  totalMs: number,
) {
  const endCardStart = totalMs - END_CARD_MS;
  const inEndCard = tMs >= endCardStart;

  // ---- Background layer ----
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (inEndCard) {
    // solid gradient end card
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, short.bg_color);
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    // Pick which screenshot is on-screen based on which beat we're in
    let idx = 0;
    let beatT = 0;
    if (short.captions?.length) {
      // Approximate: distribute beats evenly across the spoken duration
      const spokenMs = totalMs - END_CARD_MS;
      const beatMs = spokenMs / short.captions.length;
      const b = Math.min(short.captions.length - 1, Math.floor(tMs / beatMs));
      idx = Math.max(0, Math.min((images.length - 1), short.captions[b]?.screenshot_index ?? 0));
      beatT = (tMs - b * beatMs) / beatMs;
    }
    const img = images[idx];
    if (img && img.complete && img.naturalWidth > 0) {
      drawKenBurns(ctx, img, beatT);
      // dark vignette
      const vg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      vg.addColorStop(0, "rgba(0,0,0,0.55)");
      vg.addColorStop(0.5, "rgba(0,0,0,0.15)");
      vg.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, short.bg_color);
      grad.addColorStop(1, "#000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  // Brand chip top-left
  if (!inEndCard) {
    ctx.fillStyle = short.accent_color;
    ctx.fillRect(60, 90, 18, 60);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 44px ui-sans-serif, system-ui, Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("SiteScoper", 100, 120);
  }

  // ---- Hook (frame 0..900ms) ----
  const hookMs = 900;
  if (!inEndCard && tMs < hookMs && short.hook) {
    drawBigCentered(ctx, short.hook.toUpperCase(), short.accent_color, 160);
  }

  // ---- Word-by-word caption ----
  if (!inEndCard && tMs >= hookMs) {
    const words = short.caption_timings || [];
    if (words.length) {
      // find the current word window (~3 words at a time)
      let curIdx = words.findIndex((w) => tMs >= w.start_ms && tMs < w.end_ms);
      if (curIdx < 0) {
        // between words -> use the most recent word
        for (let i = words.length - 1; i >= 0; i--) {
          if (tMs >= words[i].start_ms) { curIdx = i; break; }
        }
      }
      if (curIdx >= 0) {
        const start = Math.max(0, curIdx - 1);
        const end = Math.min(words.length, curIdx + 2);
        const chunk = words.slice(start, end).map((w) => w.word);
        drawCaptionChunk(ctx, chunk, curIdx - start, short.accent_color);
      }
    }
  }

  // ---- End card ----
  if (inEndCard) {
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 140px ui-sans-serif, system-ui, Inter, sans-serif";
    ctx.fillText("sitescoper.com", WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = "600 72px ui-sans-serif, system-ui, Inter, sans-serif";
    ctx.fillStyle = short.accent_color;
    ctx.fillText("free · no signup", WIDTH / 2, HEIGHT / 2 + 90);
  }

  // Progress bar at bottom
  const p = tMs / totalMs;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(60, HEIGHT - 40, WIDTH - 120, 6);
  ctx.fillStyle = short.accent_color;
  ctx.fillRect(60, HEIGHT - 40, (WIDTH - 120) * p, 6);
}

function drawKenBurns(ctx: CanvasRenderingContext2D, img: HTMLImageElement, t: number) {
  // Fill 1080x1920 with the screenshot cropped/scaled, slow zoom + slight pan
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetAspect = WIDTH / HEIGHT;
  const imgAspect = iw / ih;
  // Base scale so the image covers the frame
  let baseW = WIDTH, baseH = HEIGHT;
  if (imgAspect > targetAspect) {
    baseH = HEIGHT;
    baseW = HEIGHT * imgAspect;
  } else {
    baseW = WIDTH;
    baseH = WIDTH / imgAspect;
  }
  const zoom = 1.05 + 0.12 * t; // 1.05 -> 1.17
  const w = baseW * zoom;
  const h = baseH * zoom;
  const panX = (WIDTH - w) / 2 + Math.sin(t * Math.PI) * 30;
  const panY = (HEIGHT - h) / 2 + t * 40; // slight downward drift
  ctx.drawImage(img, panX, panY, w, h);
}

function drawBigCentered(ctx: CanvasRenderingContext2D, text: string, accent: string, size: number) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size}px ui-sans-serif, system-ui, Inter, sans-serif`;
  const lines = wrapLines(ctx, text, WIDTH - 200);
  const lh = size * 1.05;
  const off = -((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => {
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#000";
    ctx.strokeText(l, WIDTH / 2, HEIGHT / 2 + off + i * lh);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(l, WIDTH / 2, HEIGHT / 2 + off + i * lh);
  });
  ctx.restore();
}

function drawCaptionChunk(
  ctx: CanvasRenderingContext2D,
  words: string[],
  highlightIdx: number,
  accent: string,
) {
  ctx.save();
  ctx.textBaseline = "middle";
  const size = 110;
  ctx.font = `900 ${size}px ui-sans-serif, system-ui, Inter, sans-serif`;
  // Measure total width with spaces
  const spaceW = ctx.measureText(" ").width;
  const widths = words.map((w) => ctx.measureText(w.toUpperCase()).width);
  const maxW = WIDTH - 160;
  // Wrap into lines
  const lines: { words: string[]; widths: number[]; startIdx: number }[] = [];
  let cur = { words: [] as string[], widths: [] as number[], startIdx: 0 };
  let lineW = 0;
  for (let i = 0; i < words.length; i++) {
    const w = widths[i];
    const addW = cur.words.length ? spaceW + w : w;
    if (lineW + addW > maxW && cur.words.length) {
      lines.push(cur);
      cur = { words: [], widths: [], startIdx: i };
      lineW = 0;
    }
    cur.words.push(words[i]);
    cur.widths.push(w);
    lineW += addW;
  }
  if (cur.words.length) lines.push(cur);

  const lh = size * 1.15;
  const y0 = HEIGHT / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((line, li) => {
    const totalW = line.widths.reduce((a, b) => a + b, 0) + spaceW * (line.words.length - 1);
    let x = (WIDTH - totalW) / 2;
    const y = y0 + li * lh;
    line.words.forEach((w, i) => {
      const globalIdx = line.startIdx + i;
      const upper = w.toUpperCase();
      // stroke
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#000";
      ctx.strokeText(upper, x, y);
      // fill
      ctx.fillStyle = globalIdx === highlightIdx ? accent : "#FFFFFF";
      ctx.fillText(upper, x, y);
      x += line.widths[i] + spaceW;
    });
  });
  ctx.restore();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function loadImages(paths: string[]): Promise<(HTMLImageElement | null)[]> {
  const urls = await Promise.all(paths.map((p) => (p ? signedUrl(p) : Promise.resolve(""))));
  return await Promise.all(urls.map((u) => new Promise<HTMLImageElement | null>((resolve) => {
    if (!u) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = u;
  })));
}

async function renderShortToBlob(
  short: Short,
  images: (HTMLImageElement | null)[],
  voiceUrl: string,
  setProgress: (p: number) => void,
): Promise<Blob> {
  const totalMs = short.duration_ms || 20000;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Audio pipeline: load voice into an <audio>, route through WebAudio into a MediaStream
  const audioEl = new Audio();
  audioEl.crossOrigin = "anonymous";
  audioEl.src = voiceUrl;
  await new Promise<void>((res, rej) => {
    audioEl.onloadedmetadata = () => res();
    audioEl.onerror = () => rej(new Error("voice load failed"));
  });

  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const ac = new AC();
  const src = ac.createMediaElementSource(audioEl);
  const dest = ac.createMediaStreamDestination();
  src.connect(dest);
  src.connect(ac.destination); // also play so we can monitor

  const mimeCandidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";
  // @ts-ignore
  const videoStream: MediaStream = canvas.captureStream(FPS);
  const combined = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);
  const rec = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 128_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  rec.start(100);
  audioEl.currentTime = 0;
  await audioEl.play();
  const start = performance.now();

  await new Promise<void>((resolve) => {
    function tick() {
      const elapsed = performance.now() - start;
      if (elapsed >= totalMs) { resolve(); return; }
      drawFrame(ctx, short, images, elapsed, totalMs);
      setProgress(Math.min(1, elapsed / totalMs));
      requestAnimationFrame(tick);
    }
    tick();
  });

  audioEl.pause();
  rec.stop();
  ac.close().catch(() => {});
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
  const { t } = useTranslation();
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
  const [voiceSignedUrl, setVoiceSignedUrl] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const imgs = await loadImages(short.screenshot_urls || []);
      if (!alive) return;
      setImages(imgs);
      if (short.voice_url) {
        const u = await signedUrl(short.voice_url);
        if (alive) setVoiceSignedUrl(u);
      }
    })();
    return () => { alive = false; };
  }, [short.id]);

  // Animated preview loop (silent)
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const totalMs = short.duration_ms || 20000;
    const start = performance.now();
    function tick() {
      const t = (performance.now() - start) % totalMs;
      drawFrame(ctx, short, images, t, totalMs);
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [short, images]);

  const download = async () => {
    if (!voiceSignedUrl) {
      toast({ title: t("pages.adminYoutube.voiceNotReady"), description: t("pages.adminYoutube.waitAndRetry"), variant: "destructive" });
      return;
    }
    setRendering(true);
    setProgress(0);
    try {
      const blob = await renderShortToBlob(short, images, voiceSignedUrl, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sitescoper-short-${short.id.slice(0, 8)}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("pages.adminYoutube.downloaded"), description: t("pages.adminYoutube.convertHint") });
    } catch (e: any) {
      toast({ title: t("pages.adminYoutube.renderFailed"), description: e.message, variant: "destructive" });
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
    toast({ title: t("pages.adminYoutube.newShortGenerated") });
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
        {voiceSignedUrl && (
          <audio controls className="w-full mt-2" src={voiceSignedUrl} />
        )}
      </div>
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{short.format}</Badge>
          {short.target_site && <Badge variant="outline">{new URL(short.target_site).hostname}</Badge>}
          <Badge variant={short.status === "posted" ? "default" : "secondary"}>
            {short.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(short.generated_at).toLocaleString()}
          </span>
        </div>

        <div>
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("pages.adminYoutube.script")}</div>
          <p className="text-sm">{short.script || short.insight}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">{t("pages.adminYoutube.titleLabel")} ({short.title.length})</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.title, "Title")}>
              <Copy className="h-3 w-3 mr-1" /> {t("pages.adminYoutube.copy")}
            </Button>
          </div>
          <p className="font-medium">{short.title}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">{t("pages.adminYoutube.description")}</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.description, "Description")}>
              <Copy className="h-3 w-3 mr-1" /> {t("pages.adminYoutube.copy")}
            </Button>
          </div>
          <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded">{short.description}</pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase text-muted-foreground">{t("pages.adminYoutube.tags")}</div>
            <Button size="sm" variant="ghost" onClick={() => copy(short.tags.join(", "), "Tags")}>
              <Copy className="h-3 w-3 mr-1" /> {t("pages.adminYoutube.copy")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{short.tags.join(", ")}</p>
        </div>

        <div className="flex gap-2 flex-wrap pt-2">
          <Button onClick={download} disabled={rendering}>
            {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {rendering ? `${t("pages.adminYoutube.rendering")} ${Math.round(progress * 100)}%` : t("pages.adminYoutube.downloadMp4")}
          </Button>
          <Button variant="outline" onClick={regenerate}>
            <RefreshCcw className="h-4 w-4 mr-2" /> {t("pages.adminYoutube.regenerate")}
          </Button>
          <Button variant="secondary" onClick={markPosted}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {short.status === "posted" ? t("pages.adminYoutube.markAsNotPosted") : t("pages.adminYoutube.markAsPosted")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function AdminYoutube() {
  const { t } = useTranslation();
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
    toast({ title: t("pages.adminYoutube.newShortGenerated") });
    load();
  };

  if (roleLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <div className="p-8">{t("pages.adminYoutube.adminOnly")}</div>;

  const today = shorts[0];
  const rest = shorts.slice(1);

  return (
    <main className="container mx-auto py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("pages.adminYoutube.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("pages.adminYoutube.subtitle")}
          </p>
        </div>
        <Button onClick={generateNow} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t("pages.adminYoutube.generateNow")}
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>
      ) : !today ? (
        <Card className="p-12 text-center text-muted-foreground">
          {t("pages.adminYoutube.noShorts")}
        </Card>
      ) : (
        <>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">{t("pages.adminYoutube.today")}</h2>
          <CardShort short={today} onChanged={load} />
          {rest.length > 0 && (
            <>
              <h2 className="text-sm font-semibold uppercase text-muted-foreground pt-6">{t("pages.adminYoutube.history")}</h2>
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
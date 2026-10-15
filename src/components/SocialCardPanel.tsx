import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/api";

type Format = "square" | "story";
type Theme = "ink" | "paper" | "glow";

// Canvas drawing colors are image pixels, not UI tokens; kept local to the exported artwork.
const THEMES: Record<Theme, { bg: [string, string]; fg: string; muted: string; accent: string; chip: string }> = {
  ink: { bg: ["#111214", "#1d1f24"], fg: "#f5f2ea", muted: "#a5a29a", accent: "#e8b84a", chip: "rgba(255,255,255,0.08)" },
  paper: { bg: ["#f6f1e6", "#ece4d2"], fg: "#16140f", muted: "#6b665a", accent: "#c2410c", chip: "rgba(0,0,0,0.06)" },
  glow: { bg: ["#0f3d3e", "#1f6f5c"], fg: "#ffffff", muted: "#cfe8df", accent: "#ffd166", chip: "rgba(255,255,255,0.12)" },
};

function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url || "your-site.com"; }
}

function draw(canvas: HTMLCanvasElement, opts: { format: Format; theme: Theme; domain: string; score: number; wins: string[]; labels: { title: string; wins: string; footer: string } }) {
  const W = 1080, H = opts.format === "square" ? 1080 : 1920;
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d")!;
  const th = THEMES[opts.theme];
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  const top = opts.format === "square" ? 110 : 300;
  c.textAlign = "center";
  c.fillStyle = th.muted; c.font = "600 40px Georgia, serif";
  c.fillText(opts.labels.title.toUpperCase(), W / 2, top);
  c.fillStyle = th.fg; c.font = "700 76px Georgia, serif";
  let d = opts.domain; while (c.measureText(d).width > W - 140 && d.length > 4) d = d.slice(0, -2);
  c.fillText(d, W / 2, top + 100);

  // Score ring
  const cy = top + 360, r = 170;
  c.lineWidth = 28; c.strokeStyle = th.chip;
  c.beginPath(); c.arc(W / 2, cy, r, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = th.accent; c.lineCap = "round";
  c.beginPath(); c.arc(W / 2, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * opts.score) / 100); c.stroke();
  c.fillStyle = th.fg; c.font = "800 150px Georgia, serif"; c.textBaseline = "middle";
  c.fillText(String(opts.score), W / 2, cy - 10);
  c.fillStyle = th.muted; c.font = "500 38px Georgia, serif";
  c.fillText("/ 100", W / 2, cy + 85);
  c.textBaseline = "alphabetic";

  // Wins
  let y = cy + r + (opts.format === "square" ? 100 : 180);
  c.fillStyle = th.muted; c.font = "600 34px Georgia, serif";
  c.fillText(opts.labels.wins, W / 2, y);
  y += 40;
  c.font = "600 38px Georgia, serif"; c.textAlign = "left";
  for (const w of opts.wins) {
    let txt = `✓  ${w}`; while (c.measureText(txt).width > W - 220 && txt.length > 6) txt = txt.slice(0, -2);
    if (txt !== `✓  ${w}`) txt += "…";
    c.fillStyle = th.chip; c.beginPath(); c.roundRect(90, y, W - 180, 80, 40); c.fill();
    c.fillStyle = th.fg; c.fillText(txt, 130, y + 53);
    y += 100;
  }

  c.textAlign = "center"; c.fillStyle = th.muted; c.font = "500 30px Georgia, serif";
  c.fillText(opts.labels.footer, W / 2, H - 60);
}

export function SocialCardPanel({ url, analysis }: { url: string; analysis: AnalysisResult }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<Format>("square");
  const [theme, setTheme] = useState<Theme>("ink");
  const domain = domainOf(url);
  const score = Math.round(analysis.overall_score);
  const wins = [...analysis.categories].sort((a, b) => b.score - a.score).slice(0, 3)
    .map((cat) => `${cat.name} · ${Math.round(cat.score)}/100`);

  useEffect(() => {
    if (!ref.current) return;
    draw(ref.current, { format, theme, domain, score, wins, labels: {
      title: t("socialCard.cardTitle"), wins: t("socialCard.cardWins"), footer: t("socialCard.cardFooter"),
    } });
  }, [format, theme, domain, score, wins.join("|"), t]); // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    const a = document.createElement("a");
    a.href = ref.current!.toDataURL("image/png");
    a.download = `${domain}-sitescoper-${format}.png`;
    a.click();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-heading font-bold text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" />{t("socialCard.title")}</h3>
        <p className="text-xs text-muted-foreground font-body mt-1 max-w-md">{t("socialCard.desc")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["square", "story"] as Format[]).map((f) => (
          <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)}>{t(`socialCard.format.${f}`)}</Button>
        ))}
        <span className="w-px bg-border mx-1" />
        {(["ink", "paper", "glow"] as Theme[]).map((s) => (
          <Button key={s} size="sm" variant={theme === s ? "default" : "outline"} onClick={() => setTheme(s)}>{t(`socialCard.theme.${s}`)}</Button>
        ))}
      </div>
      <canvas ref={ref} className="w-full max-w-[300px] rounded-xl border border-border" aria-label={t("socialCard.title")} />
      <Button size="sm" variant="hero" onClick={download}><Download className="h-4 w-4" />{t("socialCard.download")}</Button>
    </div>
  );
}

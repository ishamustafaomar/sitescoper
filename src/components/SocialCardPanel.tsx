import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScrapeResult } from "@/lib/api";
import type { PromoFormat, PromoStyle } from "@/lib/social-promo";
import { streamImage } from "@/lib/stream-image";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "@/lib/router-compat";

export function SocialCardPanel({ url, scrapeData, initialHeadline = "", initialDetail, initialFormat = "square" }: { url: string; scrapeData?: ScrapeResult; initialHeadline?: string; initialDetail?: string; initialFormat?: PromoFormat }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const id = useId();
  const [format, setFormat] = useState<PromoFormat>(initialFormat);
  const [style, setStyle] = useState<PromoStyle>("photo");
  const [brand, setBrand] = useState("");
  const [headline, setHeadline] = useState(initialHeadline);
  const [detail, setDetail] = useState(initialDetail ?? scrapeData?.metadata?.description?.slice(0, 240) ?? "");
  const [context, setContext] = useState(scrapeData?.markdown?.slice(0, 10000) ?? "");
  const [source, setSource] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [image, setImage] = useState("");
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photos = (scrapeData?.images ?? []).filter((p) => /^https?:\/\//.test(p.src) && !/badge|goodaitools|best-ai\.org/i.test(`${p.src} ${p.alt}`)).slice(0, 8);

  const generate = async () => {
    setBusy(true); setError(""); setImage(""); setFinal(false);
    try {
      if (!source && !sourceUrl) throw new Error(t("socialCard.sourceError"));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(t("socialCard.signIn"));
      const form = new FormData();
      if (source) form.set("image", source); else form.set("imageUrl", sourceUrl);
      for (const [key, value] of Object.entries({ brand, headline, detail, context, format, style })) form.set(key, value);
      await streamImage("/api/public/social-promo", form, (src, complete) => { setImage(src); setFinal(complete); }, undefined, { Authorization: `Bearer ${session.access_token}` });
    } catch (e) {
      setImage(""); setFinal(false);
      setError(e instanceof TypeError ? t("socialCard.sourceError") : e instanceof Error ? e.message : t("socialCard.failed"));
    } finally { setBusy(false); }
  };

  return (
    <section className="min-w-0 space-y-5 border-t border-border pt-6" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="flex items-center gap-2 font-heading text-xl"><ImageIcon className="h-4 w-4 text-primary" />{t("socialCard.title")}</h3>
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="min-w-0 space-y-4" onSubmit={(event) => { event.preventDefault(); if (!brand.trim() || !headline.trim()) return; void generate(); }}>
          <div className="space-y-2"><Label htmlFor={`${id}-brand`}>{t("socialCard.brand")}</Label><Input id={`${id}-brand`} value={brand} required pattern=".*\S.*" maxLength={100} onChange={(e) => setBrand(e.target.value)} disabled={busy} /></div>
          <div className="space-y-2"><Label htmlFor={`${id}-headline`}>{t("socialCard.headline")}</Label><Input id={`${id}-headline`} value={headline} required pattern=".*\S.*" maxLength={160} onChange={(e) => setHeadline(e.target.value)} disabled={busy} /></div>
          <div className="space-y-2"><Label htmlFor={`${id}-detail`}>{t("socialCard.detail")}</Label><Textarea id={`${id}-detail`} value={detail} maxLength={240} onChange={(e) => setDetail(e.target.value)} disabled={busy} /></div>
          <details><summary className="cursor-pointer text-sm font-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{t("socialCard.context")}</summary><Textarea className="mt-2" aria-label={t("socialCard.context")} value={context} maxLength={10000} onChange={(e) => setContext(e.target.value)} disabled={busy} /></details>
          <fieldset className="space-y-2"><legend className="mb-2 text-sm font-body font-medium">{t("socialCard.source")}</legend>
            {photos.length > 0 && <div className="grid grid-cols-4 gap-2">{photos.map((p, i) => <Button key={`${p.src}-${i}`} type="button" variant="outline" className={`h-auto aspect-square overflow-hidden p-1 ${sourceUrl === p.src ? "ring-2 ring-ring" : ""}`} aria-label={p.alt || `${t("socialCard.source")} ${i + 1}`} aria-pressed={sourceUrl === p.src} disabled={busy} onClick={() => { setSource(null); setSourceUrl(p.src); }}><img src={p.src} alt={p.alt} className="h-full w-full object-contain" loading="lazy" /></Button>)}</div>}
            <Input type="file" aria-label={t("socialCard.upload")} accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(e) => { setSource(e.target.files?.[0] ?? null); setSourceUrl(""); }} />
            {source && <p className="break-all text-xs text-muted-foreground">{source.name}</p>}
          </fieldset>
          <fieldset><legend className="mb-2 text-sm font-body font-medium">{t("socialCard.styleLabel")}</legend><div className="flex flex-wrap gap-2">{(["photo", "poster", "collage"] as PromoStyle[]).map((s) => <Button key={s} type="button" size="sm" variant={style === s ? "default" : "outline"} aria-pressed={style === s} onClick={() => setStyle(s)} disabled={busy}>{t(`socialCard.style.${s}`)}</Button>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-body font-medium">{t("socialCard.formatLabel")}</legend><div className="flex flex-wrap gap-2">{(["square", "story"] as PromoFormat[]).map((f) => <Button key={f} type="button" size="sm" variant={format === f ? "default" : "outline"} aria-pressed={format === f} onClick={() => setFormat(f)} disabled={busy}>{t(`socialCard.format.${f}`)}</Button>)}</div></fieldset>
          {user ? <Button type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> : <Sparkles className="h-4 w-4" />}{t(busy ? "socialCard.generating" : "socialCard.generate")}</Button> : <Button asChild><Link to={`/auth?redirect=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname + window.location.search)}`}>{t("socialCard.signIn")}</Link></Button>}
          {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        </form>
        <div className="min-w-0 space-y-3">
          <div className={`flex items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 ${format === "story" ? "aspect-[9/16] max-w-sm" : "aspect-square"}`} aria-busy={busy}>
            {image ? <img src={image} alt={t("socialCard.preview")} className={`h-full w-full object-contain transition-[filter] motion-reduce:transition-none ${final ? "blur-0" : "blur-2xl"}`} /> : <div role="status" className="p-6 text-center text-sm text-muted-foreground">{busy ? t("socialCard.generating") : t("socialCard.preview")}</div>}
          </div>
          {image && final && !busy && <Button asChild variant="outline"><a href={image} download={`${url.replace(/^https?:\/\//, "").replace(/[^a-z0-9.-]/gi, "_") || "website"}-promo-${format}.png`}><Download className="h-4 w-4" />{t("socialCard.download")}</a></Button>}
        </div>
      </div>
    </section>
  );
}
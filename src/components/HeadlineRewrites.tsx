import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Rewrite {
  headline: string;
  subheadline: string;
  angle: string;
  why: string;
}
interface RewriteResult {
  current_headline: string;
  diagnosis: string;
  rewrites: Rewrite[];
  cta_suggestions: string[];
}

interface Props {
  url: string;
  markdown: string;
  summary?: string;
  site_category?: string;
}

export function HeadlineRewrites({ url, markdown, summary, site_category }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-headlines", {
        body: { url, markdown: markdown.slice(0, 12000), summary, site_category },
      });
      if (error) throw new Error(error.message || "Failed");
      if (!data?.success) throw new Error(data?.error || "Failed");
      setResult(data.result);
    } catch (e: any) {
      toast({ title: t("headlineRewrites.toastErrorTitle"), description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-primary/10">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base">{t("headlineRewrites.emptyTitle")}</h3>
          <p className="text-xs text-muted-foreground font-body max-w-md mx-auto mt-1">
            {t("headlineRewrites.emptyDescription")}
          </p>
        </div>
        <Button onClick={generate} disabled={loading} variant="hero" size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? t("headlineRewrites.generating") : t("headlineRewrites.generate")}
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1">{t("headlineRewrites.currentHeadline")}</div>
        <p className="font-heading font-semibold text-sm">"{result.current_headline || t("headlineRewrites.notDetected")}"</p>
        {result.diagnosis && (
          <p className="text-xs text-muted-foreground font-body mt-2 leading-relaxed">{result.diagnosis}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {result.rewrites.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-[10px]">{r.angle}</Badge>
              <button
                onClick={() => copy(`${r.headline}\n${r.subheadline}`, i)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <h4 className="font-heading font-bold text-base leading-tight">{r.headline}</h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">{r.subheadline}</p>
            {r.why && (
              <p className="text-[11px] text-foreground/70 font-body italic pt-1 border-t border-border/50">
                {r.why}
              </p>
            )}
          </div>
        ))}
      </div>

      {result.cta_suggestions?.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-2">{t("headlineRewrites.ctaIdeas")}</div>
          <div className="flex flex-wrap gap-2">
            {result.cta_suggestions.map((c, i) => (
              <Badge key={i} variant="outline" className="text-xs font-body">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
          <Sparkles className="h-3.5 w-3.5" /> {t("headlineRewrites.generateAgain")}
        </Button>
      </div>
    </motion.div>
  );
}
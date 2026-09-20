import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Lock, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";
import { useFixPass } from "@/hooks/useFixPass";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Props {
  url: string;
  analysisId?: string;
  title?: string;
  description?: string;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function metaBlock(url: string, title: string, description: string) {
  const host = hostOf(url);
  return `<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="${host}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${url.replace(/\/$/, "")}/og.png" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${url.replace(/\/$/, "")}/og.png" />`;
}

function jsonLdBlock(url: string, title: string, description: string) {
  const host = hostOf(url);
  return `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    url,
    description,
    publisher: { "@type": "Organization", name: host, url },
  },
  null,
  2,
)}
</script>`;
}

function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">{label}</span>
        <button
          className="text-xs inline-flex items-center gap-1 text-primary hover:opacity-80"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-[11px] leading-relaxed bg-muted/50 border border-border rounded-lg p-3 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function FixPassCard({ url, analysisId, title, description }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasPass, loading } = useFixPass(url);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const headTitle = title || `${hostOf(url)} — clear value, fast pages`;
  const headDesc =
    description?.slice(0, 155) || `What ${hostOf(url)} does, who it is for, and why it is worth a click.`;

  const blocks = useMemo(
    () => ({
      meta: metaBlock(url, headTitle, headDesc),
      jsonLd: jsonLdBlock(url, headTitle, headDesc),
    }),
    [url, headTitle, headDesc],
  );

  if (loading) return null;

  if (hasPass) {
    return (
      <Card className="p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-bold text-lg">{t("fixPass.unlockedTitle")}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-body">{t("fixPass.unlockedDesc")}</p>
        <CopyBlock label={t("fixPass.metaLabel")} code={blocks.meta} />
        <CopyBlock label={t("fixPass.schemaLabel")} code={blocks.jsonLd} />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-5 md:p-6 space-y-4 border-primary/30">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-bold text-lg">{t("fixPass.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground font-body">{t("fixPass.subtitle")}</p>
        <ul className="text-sm font-body space-y-1.5">
          {["benefitMeta", "benefitSchema", "benefitPdf", "benefitWatch"].map((k) => (
            <li key={k} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{t(`fixPass.${k}`)}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={() => {
            if (!user) {
              window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname)}`;
              return;
            }
            setCheckoutOpen(true);
          }}
        >
          {t("fixPass.cta")}
        </Button>
        <p className="text-xs text-muted-foreground font-body">{t("fixPass.note")}</p>
      </Card>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("fixPass.title")}</DialogTitle>
          </DialogHeader>
          {checkoutOpen && (
            <StripeEmbeddedCheckoutForm
              priceId="fix_pass_onetime"
              fixPass={{ url, analysisId }}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              onError={(_code, msg) =>
                toast({ title: t("fixPass.errorTitle"), description: msg, variant: "destructive" })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

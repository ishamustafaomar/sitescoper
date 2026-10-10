import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/lib/router-compat";
import { Eye, FileDown, Loader2, Lock, LogIn, Sparkles, Wrench } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/AuthProvider";
import { listFixPasses } from "@/lib/fix-pass.functions";
import { CopyBlock, hostOf, jsonLdBlock, metaBlock } from "@/components/FixPassCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pass = { url: string; expires_at: string };

function PassTools({ url, expiresAt }: { url: string; expiresAt: string }) {
  const { t, i18n } = useTranslation();
  const host = hostOf(url);
  const title = `${host} — clear value, fast pages`;
  const desc = `What ${host} does, who it is for, and why it is worth a click.`;
  const blocks = useMemo(
    () => ({ meta: metaBlock(url, title, desc), jsonLd: jsonLdBlock(url, title, desc) }),
    [url, title, desc],
  );
  const expiry = new Date(expiresAt).toLocaleDateString(i18n.resolvedLanguage, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="p-5 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          {host}
        </h2>
        <span className="text-xs text-muted-foreground font-body">
          {t("fixPassPage.activeUntil", { date: expiry })}
        </span>
      </div>

      <ol className="text-sm font-body space-y-2 list-decimal list-inside text-muted-foreground">
        <li>{t("fixPassPage.step1")}</li>
        <li>{t("fixPassPage.step2")}</li>
        <li>{t("fixPassPage.step3")}</li>
      </ol>

      <CopyBlock label={t("fixPass.metaLabel")} code={blocks.meta} />
      <CopyBlock label={t("fixPass.schemaLabel")} code={blocks.jsonLd} />

      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild variant="outline" size="sm">
          <Link to="/monitoring">
            <Eye className="h-3.5 w-3.5" /> {t("fixPassPage.openWatch")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <FileDown className="h-3.5 w-3.5" /> {t("fixPassPage.openReport")}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default function FixPass() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [passes, setPasses] = useState<Pass[] | null>(null);
  const [wildcardUrl, setWildcardUrl] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPasses([]);
      return;
    }
    setPasses(null);
    let cancelled = false;
    listFixPasses()
      .then((p) => {
        if (!cancelled) setPasses(p);
      })
      .catch(() => {
        if (!cancelled) setPasses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  const wildcard = passes?.some((p) => p.url === "*") ?? false;
  const realPasses = (passes ?? []).filter((p) => p.url !== "*");
  const wildcardValid = /^https?:\/\/.+\..+/.test(wildcardUrl.trim());

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">{t("fixPassPage.title")}</h1>
          <p className="text-sm text-muted-foreground font-body">{t("fixPassPage.subtitle")}</p>
        </header>

        {authLoading || (user && passes === null) ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Card className="p-6 space-y-4 border-primary/30">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold">{t("fixPassPage.signedOutTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground font-body">{t("fixPassPage.signedOutDesc")}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/auth?redirect=/fix-pass">
                  <LogIn className="h-4 w-4" /> {t("nav.signIn")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing#fix-pass">{t("fixPassPage.seeOffer")}</Link>
              </Button>
            </div>
          </Card>
        ) : realPasses.length === 0 && !wildcard ? (
          <Card className="p-6 space-y-4 border-primary/30">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h2 className="font-heading font-semibold">{t("fixPassPage.emptyTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground font-body">{t("fixPassPage.emptyDesc")}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/">
                  <Sparkles className="h-4 w-4" /> {t("fixPassPage.emptyCta")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing#fix-pass">{t("fixPassPage.seeOffer")}</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {realPasses.map((p) => (
              <PassTools key={p.url} url={p.url} expiresAt={p.expires_at} />
            ))}
            {wildcard && (
              <Card className="p-5 md:p-6 space-y-4">
                <h2 className="font-heading font-bold text-lg">{t("fixPassPage.wildcardTitle")}</h2>
                <p className="text-sm text-muted-foreground font-body">{t("fixPassPage.wildcardDesc")}</p>
                <Input
                  value={wildcardUrl}
                  onChange={(e) => setWildcardUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="font-body"
                />
                {wildcardValid && (
                  <PassTools url={wildcardUrl.trim()} expiresAt="2099-01-01T00:00:00Z" />
                )}
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

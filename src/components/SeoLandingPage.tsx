import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UrlInput } from "@/components/UrlInput";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/blog/Markdown";
import type { LandingPageContent } from "@/content/landing-pages";

/**
 * Editorial landing page for a specific search intent (UX audit, CRO audit…).
 * Every one of these pages is a working entry point: the URL box hands the
 * address to the homepage, which starts the free audit immediately.
 */
export function SeoLandingPage({ content }: { content: LandingPageContent }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handoff = (url: string) => {
    const params = new URLSearchParams({ url });
    if (content.focus) params.set("focus", content.focus);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full">
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 pt-12 pb-14 md:pt-20 md:pb-20">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
              <ol className="flex items-center gap-2">
                <li><Link to="/" className="hover:text-foreground">Home</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-foreground/80">{content.breadcrumb}</li>
              </ol>
            </nav>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-4">{content.eyebrow}</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-balance mb-5 max-w-3xl">{content.h1}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">{content.intro}</p>
            <div className="max-w-2xl">
              <UrlInput onSubmit={handoff} isLoading={false} />
              <p className="mt-3 text-xs text-muted-foreground">{t("hero.freeScansFootnote")}</p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 max-w-3xl">
              {content.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0 max-w-3xl">
            <div className="prose-like text-[17px]">
              <Markdown body={content.body} />
            </div>

            <section className="mt-12" aria-labelledby="landing-faq">
              <h2 id="landing-faq" className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-4">Frequently asked questions</h2>
              <dl className="divide-y divide-border border border-border">
                {content.faq.map((f) => (
                  <div key={f.q} className="p-5">
                    <dt className="font-heading font-semibold text-base mb-1.5">{f.q}</dt>
                    <dd className="text-foreground/85 leading-relaxed text-[15px]">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-12 border border-foreground bg-card p-6 md:p-8">
              <h2 className="font-heading text-2xl font-semibold mb-2">{content.ctaTitle}</h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-xl">{content.ctaBody}</p>
              <UrlInput onSubmit={handoff} isLoading={false} />
            </section>
          </article>

          <aside className="space-y-6">
            <div className="border border-border bg-card/40 p-5 text-sm">
              <p className="font-heading font-semibold mb-3">Related guides</p>
              <ul className="space-y-2.5">
                {content.related.map((r) => (
                  <li key={r.path}>
                    <Link to={r.path} className="group inline-flex items-start gap-1.5 text-foreground/85 hover:text-primary">
                      <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden />
                      <span>{r.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border bg-card/40 p-5 text-sm">
              <p className="font-heading font-semibold mb-3">Free tools</p>
              <ul className="space-y-2.5">
                <li><Link to="/tools/open-graph-checker" className="hover:text-primary">Open Graph &amp; meta tag checker</Link></li>
                <li><Link to="/tools/llms-txt-generator" className="hover:text-primary">llms.txt generator</Link></li>
                <li><Link to="/ai-website-audit-tool" className="hover:text-primary">AI website audit tool</Link></li>
              </ul>
            </div>
            <div className="border border-border p-5 text-sm">
              <p className="font-heading font-semibold mb-1">Pro</p>
              <p className="text-muted-foreground mb-3">Unlimited audits, competitor compare, weekly site watching and PDF reports. 7-day free trial.</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

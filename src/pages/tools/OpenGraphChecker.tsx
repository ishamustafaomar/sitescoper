import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Check, Copy, Loader2, X, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/blog/Markdown";
import { checkOpenGraph, type OpenGraphResult, type TagCheck } from "@/lib/seo-tools.functions";
import { openGraphArticle, openGraphFaq } from "@/content/tools";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LevelIcon({ level }: { level: TagCheck["level"] }) {
  if (level === "pass") return <Check className="h-4 w-4 text-primary" aria-label="Pass" />;
  if (level === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" aria-label="Warning" />;
  return <X className="h-4 w-4 text-destructive" aria-label="Fail" />;
}

function Preview({ result }: { result: OpenGraphResult }) {
  const title = result.og["og:title"] || result.title || "(no title)";
  const desc = result.og["og:description"] || result.description || "";
  const host = hostOf(result.finalUrl);
  const img = result.image?.ok && result.image.url ? result.image.url : null;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <figure className="border border-border bg-card p-4">
        <figcaption className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Google result</figcaption>
        <div className="font-body">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {result.favicon ? <img src={result.favicon} alt="" className="h-4 w-4 rounded-sm" loading="lazy" /> : <span className="h-4 w-4 rounded-full bg-muted inline-block" />}
            <span>{host}</span>
          </div>
          <p className="text-[18px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8] line-clamp-1">{result.title || "(no title)"}</p>
          <p className="text-sm text-foreground/80 line-clamp-2 mt-1">{result.description || "Google will pick text from the page."}</p>
        </div>
      </figure>

      <figure className="border border-border bg-card overflow-hidden">
        <figcaption className="text-xs uppercase tracking-wider text-muted-foreground p-4 pb-3">Facebook / LinkedIn</figcaption>
        <div className="aspect-[1.91/1] bg-muted flex items-center justify-center overflow-hidden">
          {img ? <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-xs text-muted-foreground">No image</span>}
        </div>
        <div className="p-3 bg-muted/40">
          <p className="text-[11px] uppercase text-muted-foreground">{host}</p>
          <p className="font-semibold text-sm line-clamp-2">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{desc}</p>
        </div>
      </figure>

      <figure className="border border-border bg-card overflow-hidden">
        <figcaption className="text-xs uppercase tracking-wider text-muted-foreground p-4 pb-3">X (Twitter)</figcaption>
        <div className="m-4 mt-0 rounded-2xl border border-border overflow-hidden">
          <div className="aspect-[2/1] bg-muted flex items-center justify-center overflow-hidden">
            {img ? <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-xs text-muted-foreground">No image</span>}
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">{host}</p>
            <p className="text-sm line-clamp-1">{result.twitter["twitter:title"] || title}</p>
          </div>
        </div>
      </figure>

      <figure className="border border-border bg-card p-4">
        <figcaption className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Slack / WhatsApp / iMessage</figcaption>
        <div className="flex gap-3 border-l-4 border-primary/60 pl-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{result.og["og:site_name"] || host}</p>
            <p className="text-sm font-semibold line-clamp-1">{title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
          </div>
          {img && <img src={img} alt="" className="h-16 w-16 shrink-0 object-cover" loading="lazy" />}
        </div>
      </figure>
    </div>
  );
}

const OpenGraphChecker = () => {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mutation = useMutation({
    mutationFn: (u: string) => checkOpenGraph({ data: { url: u } }),
    onSuccess: () => setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50),
  });

  // Deep link: /tools/open-graph-checker?url=https://example.com
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("url");
    if (q) {
      setUrl(q);
      mutation.mutate(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = mutation.data;
  const fails = result?.checks.filter((c) => c.level === "fail") ?? [];
  const warns = result?.checks.filter((c) => c.level === "warn") ?? [];
  const passes = result?.checks.filter((c) => c.level === "pass") ?? [];

  const copyHead = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.suggestedHead);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full">
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 pt-12 pb-12 md:pt-20 md:pb-16">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
              <ol className="flex items-center gap-2">
                <li><Link to="/" className="hover:text-foreground">Home</Link></li>
                <li aria-hidden>/</li>
                <li><Link to="/tools" className="hover:text-foreground">Free tools</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-foreground/80">Open Graph checker</li>
              </ol>
            </nav>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-4">Free tool</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-balance mb-5 max-w-3xl">Open Graph &amp; meta tag checker</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              See exactly how a link will look on Google, Facebook, LinkedIn, X, Slack and WhatsApp — and get a copy-paste fix for every missing or broken tag. Checks the real image size and weight, not just whether the tag exists.
            </p>
            <form
              className="max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (url.trim()) mutation.mutate(url.trim());
              }}
            >
              <div className="flex flex-col sm:flex-row items-stretch border border-foreground bg-card">
                <label htmlFor="og-url" className="sr-only">Page URL</label>
                <Input
                  id="og-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 h-14 px-4 text-base"
                  disabled={mutation.isPending}
                  inputMode="url"
                  autoComplete="url"
                />
                <button
                  type="submit"
                  disabled={mutation.isPending || !url.trim()}
                  className="shrink-0 h-14 px-8 bg-primary text-primary-foreground font-medium text-sm inline-flex items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l border-foreground hover:bg-foreground/85 disabled:opacity-40 transition-colors"
                >
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {mutation.isPending ? "Checking…" : "Check tags"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Free, no account. We fetch the page once and never store it.</p>
              {mutation.isError && (
                <p role="alert" className="mt-3 text-sm text-destructive">{(mutation.error as Error).message}</p>
              )}
            </form>
          </div>
        </section>

        {result && (
          <section ref={resultsRef} className="max-w-5xl mx-auto px-4 py-12 scroll-mt-20" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Results for</p>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold break-all">{result.finalUrl}</h2>
              </div>
              <div className="text-right">
                <p className="font-heading text-5xl font-bold leading-none">{result.score}<span className="text-lg text-muted-foreground">/100</span></p>
                <p className="text-xs text-muted-foreground mt-1">{fails.length} failing · {warns.length} warnings · {passes.length} passing</p>
              </div>
            </div>

            <h3 className="font-heading text-xl font-semibold mb-4">How the link will look</h3>
            <Preview result={result} />

            <h3 className="font-heading text-xl font-semibold mt-12 mb-4">Checks</h3>
            <ul className="divide-y divide-border border border-border">
              {[...fails, ...warns, ...passes].map((c) => (
                <li key={c.id} className="p-4 flex gap-3">
                  <span className="mt-0.5 shrink-0"><LevelIcon level={c.level} /></span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{c.label}</p>
                    <p className="text-sm text-muted-foreground break-words">{c.detail}</p>
                    {c.fix && c.level !== "pass" && <p className="text-sm mt-1"><span className="font-medium">Fix:</span> {c.fix}</p>}
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="font-heading text-xl font-semibold mt-12 mb-2">Ready-to-paste head tags</h3>
            <p className="text-sm text-muted-foreground mb-3">Built from what the page already has, with the gaps filled in. Replace the placeholder image path if you do not have a share image yet.</p>
            <div className="relative">
              <pre className="overflow-x-auto border border-border bg-muted/50 p-4 text-[13px] leading-relaxed"><code>{result.suggestedHead}</code></pre>
              <Button type="button" size="sm" variant="outline" className="absolute top-2 right-2" onClick={copyHead}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <details className="mt-8 border border-border">
              <summary className="cursor-pointer p-4 font-medium text-sm">All tags found on the page</summary>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {[["title", result.title], ["description", result.description], ["canonical", result.canonical], ["lang", result.lang], ["robots", result.robots], ...Object.entries(result.og), ...Object.entries(result.twitter)]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <tr key={k} className="border-t border-border align-top">
                          <th scope="row" className="px-4 py-2 text-left font-mono text-xs whitespace-nowrap">{k}</th>
                          <td className="px-4 py-2 break-all text-foreground/85">{v}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>

            <div className="mt-10 border border-foreground bg-card p-6 md:p-8">
              <h3 className="font-heading text-2xl font-semibold mb-2">Tags are one signal. Want the whole picture?</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xl">Run a full audit of {hostOf(result.finalUrl)}: UX, SEO, copy, conversion and speed, ranked by what to fix first. Free, no account.</p>
              <Button asChild>
                <Link to={`/?url=${encodeURIComponent(result.finalUrl)}`}>Audit this site <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </section>
        )}

        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0 max-w-3xl prose-like text-[17px]">
            <Markdown body={openGraphArticle} />
            <h2 className="mt-12 mb-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Frequently asked questions</h2>
            <dl className="divide-y divide-border border border-border not-prose">
              {openGraphFaq.map((f) => (
                <div key={f.q} className="p-5">
                  <dt className="font-heading font-semibold text-base mb-1.5">{f.q}</dt>
                  <dd className="text-foreground/85 leading-relaxed text-[15px]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </article>
          <aside className="space-y-6 text-sm">
            <div className="border border-border bg-card/40 p-5">
              <p className="font-heading font-semibold mb-3">More free tools</p>
              <ul className="space-y-2.5">
                <li><Link to="/tools/llms-txt-generator" className="hover:text-primary">llms.txt generator</Link></li>
                <li><Link to="/ai-website-audit-tool" className="hover:text-primary">AI website audit</Link></li>
                <li><Link to="/landing-page-audit" className="hover:text-primary">Landing page audit</Link></li>
              </ul>
            </div>
            <div className="border border-border bg-card/40 p-5">
              <p className="font-heading font-semibold mb-3">Related guides</p>
              <ul className="space-y-2.5">
                <li><Link to="/blog/open-graph-tags-guide" className="hover:text-primary">Open Graph tags: the complete guide</Link></li>
                <li><Link to="/blog/meta-description-best-practices-for-more-clicks" className="hover:text-primary">Meta description best practices</Link></li>
                <li><Link to="/blog/schema-markup-for-seo-your-essential-guide" className="hover:text-primary">Schema markup for SEO</Link></li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default OpenGraphChecker;

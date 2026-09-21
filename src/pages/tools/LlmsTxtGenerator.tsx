import { useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, Copy, Download, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/blog/Markdown";
import { generateLlmsTxt } from "@/lib/seo-tools.functions";
import { llmsTxtArticle, llmsTxtFaq } from "@/content/tools";

const LlmsTxtGenerator = () => {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mutation = useMutation({
    mutationFn: (u: string) => generateLlmsTxt({ data: { url: u, maxPages: 30 } }),
    onSuccess: (data) => {
      setContent(data.content);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
  });
  const result = mutation.data;

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(a.href);
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
                <li aria-current="page" className="text-foreground/80">llms.txt generator</li>
              </ol>
            </nav>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-primary mb-4">Free tool</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-balance mb-5 max-w-3xl">llms.txt generator</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Generate a spec-compliant <code className="font-mono text-base bg-muted px-1.5 py-0.5 rounded">llms.txt</code> for any website in seconds. We read your sitemap and pages, pull the real titles and descriptions, group them into sections and hand you a file you can edit, copy and upload.
            </p>
            <form
              className="max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (url.trim()) mutation.mutate(url.trim());
              }}
            >
              <div className="flex flex-col sm:flex-row items-stretch border border-foreground bg-card">
                <label htmlFor="llms-url" className="sr-only">Website URL</label>
                <Input
                  id="llms-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com"
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
                  {mutation.isPending ? "Reading your site…" : "Generate llms.txt"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Reads up to 30 public pages. Takes 5–20 seconds depending on the site. Nothing is stored.</p>
              {mutation.isError && <p role="alert" className="mt-3 text-sm text-destructive">{(mutation.error as Error).message}</p>}
            </form>
          </div>
        </section>

        {result && (
          <section ref={resultsRef} className="max-w-5xl mx-auto px-4 py-12 scroll-mt-20" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Generated for</p>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold">{result.siteName}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.pagesFetched} pages described{result.sitemap ? ` · discovered via ${new URL(result.sitemap).pathname}` : " · discovered from homepage links"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" size="sm" onClick={download}>
                  <Download className="h-3.5 w-3.5" /> Download llms.txt
                </Button>
              </div>
            </div>
            {result.warnings.map((w) => (
              <p key={w} className="mb-4 border border-amber-600/40 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">{w}</p>
            ))}
            <label htmlFor="llms-output" className="sr-only">llms.txt content</label>
            <textarea
              id="llms-output"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[420px] border border-border bg-muted/40 p-4 font-mono text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
              <div className="border border-border p-4">
                <p className="font-heading font-semibold mb-1">1. Edit</p>
                <p className="text-muted-foreground">Tighten the summary line and delete pages that are not useful to an assistant (legal, login, thin tags).</p>
              </div>
              <div className="border border-border p-4">
                <p className="font-heading font-semibold mb-1">2. Upload</p>
                <p className="text-muted-foreground">Place the file at the site root so it is served at <code className="font-mono">{result.origin}/llms.txt</code> as plain text.</p>
              </div>
              <div className="border border-border p-4">
                <p className="font-heading font-semibold mb-1">3. Verify</p>
                <p className="text-muted-foreground">Open the URL in a browser. You should see the markdown, not a 404 or your app shell.</p>
              </div>
            </div>
            <div className="mt-10 border border-foreground bg-card p-6 md:p-8">
              <h3 className="font-heading text-2xl font-semibold mb-2">Is your site readable by AI at all?</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xl">llms.txt helps assistants find the right pages. Whether they can understand those pages is another matter. Run a free audit to check content clarity, structure and crawlability.</p>
              <Button asChild>
                <Link to={`/?url=${encodeURIComponent(result.origin)}`}>Audit {result.siteName} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </section>
        )}

        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0 max-w-3xl prose-like text-[17px]">
            <Markdown body={llmsTxtArticle} />
            <h2 className="mt-12 mb-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Frequently asked questions</h2>
            <dl className="divide-y divide-border border border-border">
              {llmsTxtFaq.map((f) => (
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
                <li><Link to="/tools/open-graph-checker" className="hover:text-primary">Open Graph &amp; meta tag checker</Link></li>
                <li><Link to="/ai-website-audit-tool" className="hover:text-primary">AI website audit</Link></li>
                <li><Link to="/seo-audit-report" className="hover:text-primary">SEO audit report</Link></li>
              </ul>
            </div>
            <div className="border border-border bg-card/40 p-5">
              <p className="font-heading font-semibold mb-3">Related guides</p>
              <ul className="space-y-2.5">
                <li><Link to="/blog/what-is-llms-txt" className="hover:text-primary">What is llms.txt? Does it help SEO?</Link></li>
                <li><Link to="/blog/ai-website-audit-vs-traditional-seo-tools" className="hover:text-primary">AI audits vs. traditional SEO tools</Link></li>
                <li><Link to="/website-audit-statistics" className="hover:text-primary">Website audit statistics</Link></li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LlmsTxtGenerator;

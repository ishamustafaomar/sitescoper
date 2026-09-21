import { getRouteApi } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { ArrowLeft, CalendarDays, Clock, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Markdown, extractToc } from "@/components/blog/Markdown";
import { BLOG_CATEGORIES } from "@/lib/blog-queries";
import { UrlInput } from "@/components/UrlInput";
import { useNavigate } from "@/lib/router-compat";

const routeApi = getRouteApi("/blog/$slug");

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const BlogPost = () => {
  const { t } = useTranslation();
  const { post, related } = routeApi.useLoaderData();
  const navigate = useNavigate();

  const toc = extractToc(post.body);
  const updated = new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86_400_000;
  const categoryLabel = BLOG_CATEGORIES[post.category] ?? "Guides";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0 max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link to="/" className="hover:text-foreground">{t("blog.home")}</Link></li>
                <li aria-hidden>/</li>
                <li><Link to="/blog" className="hover:text-foreground">{t("blog.blog")}</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-foreground/80">{categoryLabel}</li>
              </ol>
            </nav>

            <header className="mb-8">
              <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4 text-balance">{post.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{post.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <Link to="/about" rel="author" className="font-medium text-foreground/80 hover:text-primary">{post.author}</Link>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </span>
                {updated && (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {post.reading_time} {t("blog.read")}
                </span>
              </div>
            </header>

            {toc.length >= 3 && (
              <nav aria-label="Table of contents" className="lg:hidden mb-8 rounded-lg border border-border bg-card/40 p-4 text-sm">
                <p className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">In this guide</p>
                <ol className="space-y-1.5 list-decimal pl-5">
                  {toc.map((item) => (
                    <li key={item.id}><a href={`#${item.id}`} className="hover:text-primary">{item.text}</a></li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="prose-like text-[17px]">
              <Markdown body={post.body} />
            </div>

            {post.faq.length > 0 && (
              <section className="mt-12" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-heading text-2xl font-semibold tracking-tight mb-4 md:text-3xl">Frequently asked questions</h2>
                <dl className="divide-y divide-border rounded-lg border border-border">
                  {post.faq.map((f, i) => (
                    <div key={i} className="p-5">
                      <dt className="font-heading font-semibold text-base mb-1.5">{f.q}</dt>
                      <dd className="text-foreground/85 leading-relaxed text-[15px]">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="mt-12 border border-foreground bg-card p-6 md:p-8" aria-labelledby="audit-cta">
              <h2 id="audit-cta" className="text-2xl font-heading font-semibold mb-2">{t("blog.auditCta")}</h2>
              <p className="text-muted-foreground mb-5 max-w-xl text-sm">{t("blog.auditCtaDesc")}</p>
              <UrlInput
                onSubmit={(url) => navigate(`/?${new URLSearchParams({ url }).toString()}`)}
                isLoading={false}
              />
            </section>

            {related.length > 0 && (
              <aside className="mt-16">
                <h2 className="text-sm font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-4">{t("blog.keepReading")}</h2>
                <ul className="grid sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link to={`/blog/${r.slug}`} className="block rounded-lg border bg-card p-4 hover:border-primary/40 transition-colors h-full">
                        <h3 className="font-heading font-semibold text-sm mb-1">{r.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/blog">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {t("blog.backToBlog")}
                    </Link>
                  </Button>
                </div>
              </aside>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {toc.length >= 3 && (
                <nav aria-label="Table of contents" className="text-sm">
                  <p className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">In this guide</p>
                  <ol className="space-y-2 border-l border-border">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`} className="block -ml-px border-l border-transparent pl-3 text-muted-foreground hover:border-primary hover:text-foreground leading-snug">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="rounded-lg border border-border bg-card/40 p-4 text-sm">
                <p className="font-heading font-semibold mb-1">Free tools</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li><Link to="/tools/open-graph-checker" className="hover:text-primary">Open Graph checker</Link></li>
                  <li><Link to="/tools/llms-txt-generator" className="hover:text-primary">llms.txt generator</Link></li>
                  <li><Link to="/ai-website-audit-tool" className="hover:text-primary">AI website audit</Link></li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;

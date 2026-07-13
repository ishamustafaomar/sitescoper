import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface BlogRow {
  slug: string;
  title: string;
  description: string;
  reading_time: string;
  published_at: string;
  body: string;
}

// Minimal markdown renderer: ## h2, ### h3, "- " bullets, blank-line
// paragraphs, **bold**, [text](url) links.
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-heading font-semibold mt-10 mb-3">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-heading font-semibold mt-6 mb-2">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.split("\n").every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="list-disc pl-6 my-4 space-y-2 text-foreground/90">
          {block.split("\n").map((l, j) => (
            <li key={j}>{renderInline(l.slice(2))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-4 leading-relaxed text-foreground/90">
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) parts.push(renderBold(text.slice(last, m.index), key++));
    const href = m[2];
    const isExternal = /^https?:\/\//.test(href);
    parts.push(
      isExternal ? (
        <a key={`l${key++}`} href={href} className="text-primary underline underline-offset-4 hover:opacity-80" target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      ) : (
        <Link key={`l${key++}`} to={href} className="text-primary underline underline-offset-4 hover:opacity-80">
          {m[1]}
        </Link>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(renderBold(text.slice(last), key++));
  return parts;
}

function renderBold(text: string, key: number): React.ReactNode {
  const segs = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span key={key}>
      {segs.map((s, i) =>
        s.startsWith("**") && s.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">{s.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{s}</span>
        ),
      )}
    </span>
  );
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    enabled: !!slug,
    queryFn: async (): Promise<BlogRow | null> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, description, reading_time, published_at, body")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data as BlogRow | null) ?? null;
    },
    staleTime: 60_000,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["blog-related", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, description")
        .neq("slug", slug!)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const ld = useMemo(() => {
    if (!post) return null;
    const url = `https://sitescoper.com/blog/${post.slug}`;
    return {
      article: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.published_at,
        dateModified: post.published_at,
        author: { "@type": "Organization", name: "SiteScoper" },
        publisher: {
          "@type": "Organization",
          name: "SiteScoper",
          logo: { "@type": "ImageObject", url: "https://sitescoper.com/favicon.ico" },
        },
        mainEntityOfPage: url,
        url,
      },
      breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://sitescoper.com/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://sitescoper.com/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !post) return <Navigate to="/blog" replace />;

  const url = `https://sitescoper.com/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{`${post.title} | SiteScoper`}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at} />
        {ld && <script type="application/ld+json">{JSON.stringify(ld.article)}</script>}
        {ld && <script type="application/ld+json">{JSON.stringify(ld.breadcrumb)}</script>}
      </Helmet>
      <AppHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 md:py-16 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">{t("blog.home")}</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-foreground">{t("blog.blog")}</Link>
        </nav>

        <article>
          <header className="mb-8">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
              <span aria-hidden>·</span>
              <span>{post.reading_time} {t("blog.read")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground">{post.description}</p>
          </header>

          <div className="prose-like">{renderBody(post.body)}</div>

          <section className="mt-12 rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent p-8 text-center">
            <h2 className="text-2xl font-heading font-bold mb-2">{t("blog.auditCta")}</h2>
            <p className="text-muted-foreground mb-5 max-w-xl mx-auto text-sm">
              {t("blog.auditCtaDesc")}
            </p>
            <Button asChild size="lg">
              <Link to="/">{t("blog.runFreeAudit")}</Link>
            </Button>
          </section>
        </article>

        {related.length > 0 && (
          <aside className="mt-16">
            <h2 className="text-sm font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t("blog.keepReading")}
            </h2>
            <ul className="grid sm:grid-cols-3 gap-4">
              {related.map((r: any) => (
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
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;

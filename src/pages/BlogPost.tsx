import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { findPost, posts } from "@/content/blog";

// Minimal markdown renderer: ## h2, ### h3, "- " bullets, blank-line
// paragraphs, **bold**, [text](url) links. Keeps the bundle small.
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
  // Handle links first, then bold. Returns a fragment of strings + elements.
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
  const post = slug ? findPost(slug) : undefined;

  const related = useMemo(
    () => posts.filter((p) => p.slug !== slug).slice(0, 3),
    [slug],
  );

  if (!post) return <Navigate to="/blog" replace />;

  const url = `https://sitescoper.com/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "SiteScoper" },
    publisher: {
      "@type": "Organization",
      name: "SiteScoper",
      logo: { "@type": "ImageObject", url: "https://sitescoper.com/favicon.ico" },
    },
    mainEntityOfPage: url,
    url,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://sitescoper.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://sitescoper.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

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
        <meta property="article:published_time" content={post.date} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <AppHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 md:py-16 w-full">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
        </nav>

        <article>
          <header className="mb-8">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
              <span aria-hidden>·</span>
              <span>{post.readingTime} read</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">{post.title}</h1>
            <p className="text-lg text-muted-foreground">{post.description}</p>
          </header>

          <div className="prose-like">{renderBody(post.body)}</div>

          <section className="mt-12 rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent p-8 text-center">
            <h2 className="text-2xl font-heading font-bold mb-2">Audit your site in 60 seconds</h2>
            <p className="text-muted-foreground mb-5 max-w-xl mx-auto text-sm">
              SiteScoper turns this whole checklist into a single, prioritised report. Free to try.
            </p>
            <Button asChild size="lg">
              <Link to="/">Run a free audit</Link>
            </Button>
          </section>
        </article>

        <aside className="mt-16">
          <h2 className="text-sm font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Keep reading
          </h2>
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
                Back to blog
              </Link>
            </Button>
          </div>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;

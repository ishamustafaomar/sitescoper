import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { posts } from "@/content/blog";

const Blog = () => {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SiteScoper Blog",
    url: "https://sitescoper.com/blog",
    description:
      "Practical SEO, website audit, and conversion guides for founders, indie hackers, and small business owners.",
    blogPost: sorted.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `https://sitescoper.com/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>SEO &amp; Website Audit Blog — SiteScoper</title>
        <meta
          name="description"
          content="Practical SEO, website audit, and conversion guides for founders and small business owners. New posts monthly."
        />
        <link rel="canonical" href="https://sitescoper.com/blog" />
        <meta property="og:title" content="SiteScoper Blog — SEO & Website Audit Guides" />
        <meta
          property="og:description"
          content="Practical SEO, website audit, and conversion guides for founders."
        />
        <meta property="og:url" content="https://sitescoper.com/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(blogLd)}</script>
      </Helmet>
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 md:py-20 w-full">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            The SiteScoper Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical guides on website audits, SEO, Core Web Vitals, and conversion — written for founders who have to ship the fixes themselves.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-5">
          {sorted.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
              <Card className="h-full p-6 transition-colors group-hover:border-primary/40">
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{p.readingTime}</span>
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Blog;

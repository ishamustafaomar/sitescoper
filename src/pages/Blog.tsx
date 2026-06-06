import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface BlogRow {
  slug: string;
  title: string;
  description: string;
  reading_time: string;
  published_at: string;
}

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async (): Promise<BlogRow[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, description, reading_time, published_at")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogRow[];
    },
    staleTime: 60_000,
  });

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SiteScoper Blog",
    url: "https://sitescoper.com/blog",
    description:
      "Practical SEO, website audit, and conversion guides for founders and small business owners. New posts every day.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.published_at,
      url: `https://sitescoper.com/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>SEO &amp; Website Audit Blog — SiteScoper</title>
        <meta
          name="description"
          content="Practical SEO, website audit, and conversion guides for founders. New posts every day, written for people who ship the fixes themselves."
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
            Practical guides on website audits, SEO, Core Web Vitals, and conversion — a fresh post published every day.
          </p>
        </header>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {posts.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
                <Card className="h-full p-6 transition-colors group-hover:border-primary/40">
                  <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                    <time dateTime={p.published_at}>
                      {new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </time>
                    <span aria-hidden>·</span>
                    <span>{p.reading_time}</span>
                  </div>
                  <h2 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Blog;

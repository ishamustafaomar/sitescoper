import { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { BLOG_CATEGORIES } from "@/lib/blog-queries";

const routeApi = getRouteApi("/blog/");

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Blog = () => {
  const { t } = useTranslation();
  const { posts } = routeApi.useLoaderData();
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const present = new Set(posts.map((p) => p.category));
    return Object.entries(BLOG_CATEGORIES).filter(([key]) => present.has(key));
  }, [posts]);

  const visible = category === "all" ? posts : posts.filter((p) => p.category === category);
  const [featured, ...rest] = visible;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 md:py-20 w-full">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">{t("blog.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </header>

        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Categories">
            {[["all", "All"], ...categories].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={category === key}
                onClick={() => setCategory(key)}
                className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === key ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="group block mb-8">
            <Card className="p-7 md:p-9 transition-colors group-hover:border-primary/40 border-foreground">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                <span className="font-medium text-primary">{BLOG_CATEGORIES[featured.category] ?? "Guides"}</span>
                <span aria-hidden>·</span>
                <time dateTime={featured.published_at}>{formatDate(featured.published_at)}</time>
                <span aria-hidden>·</span>
                <span>{featured.reading_time}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors text-balance">
                {featured.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{featured.description}</p>
            </Card>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {rest.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group">
              <Card className="h-full p-6 transition-colors group-hover:border-primary/40">
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="font-medium text-primary">{BLOG_CATEGORIES[p.category] ?? "Guides"}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={p.published_at}>{formatDate(p.published_at)}</time>
                  <span aria-hidden>·</span>
                  <span>{p.reading_time}</span>
                </div>
                <h2 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        {visible.length === 0 && <p className="text-muted-foreground">No posts in this category yet.</p>}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Blog;

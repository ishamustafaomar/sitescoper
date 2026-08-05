import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import { supabase } from "@/integrations/supabase/client";
import Blog from "@/pages/Blog";

const DESCRIPTION =
  "Practical guides on SEO, conversion, performance, and AI-powered website audits.";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, description, published_at")
      .order("published_at", { ascending: false })
      .limit(50);
    return { posts: data ?? [] };
  },
  head: ({ loaderData }) =>
    pageHead({
      path: "/blog",
      title: "Blog — SiteScoper",
      description: DESCRIPTION,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "SiteScoper Blog",
          url: "https://sitescoper.com/blog",
          description: DESCRIPTION,
          blogPost: (loaderData?.posts ?? []).map((p: any) => ({
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            datePublished: p.published_at,
            url: `https://sitescoper.com/blog/${p.slug}`,
          })),
        },
      ],
    }),
  component: Blog,
});

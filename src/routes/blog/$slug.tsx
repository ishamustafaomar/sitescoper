import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, description, published_at")
      .eq("slug", params.slug)
      .maybeSingle();
    return { post: data ?? null };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return pageHead({
        path: `/blog/${params.slug}`,
        title: "Post not found — SiteScoper",
        description: "This blog post doesn't exist.",
        noindex: true,
      });
    }
    return pageHead({
      path: `/blog/${post.slug}`,
      title: `${post.title} | SiteScoper`,
      description: post.description,
      ogType: "article",
      publishedTime: post.published_at,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.published_at,
          dateModified: post.published_at,
          author: { "@type": "Organization", name: "SiteScoper" },
          mainEntityOfPage: `https://sitescoper.com/blog/${post.slug}`,
          publisher: { "@type": "Organization", name: "SiteScoper" },
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
      ],
    });
  },
  component: BlogPost,
});

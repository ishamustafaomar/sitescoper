import { createFileRoute } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { pageHead } from "@/lib/seo-head";
import { posts } from "@/content/blog";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) {
      return pageHead({
        path: `/blog/${params.slug}`,
        title: "Post not found — SiteScoper",
        description: "This blog post doesn't exist.",
        noindex: true,
      });
    }
    const head = pageHead({
      path: `/blog/${post.slug}`,
      title: `${post.title} | SiteScoper`,
      description: post.description,
      ogType: "article",
      publishedTime: post.date,
    });
    return {
      ...head,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            mainEntityOfPage: `https://sitescoper.com/blog/${post.slug}`,
            publisher: { "@type": "Organization", name: "SiteScoper" },
          }),
        },
      ],
    };
  },
  component: BlogPost,
});

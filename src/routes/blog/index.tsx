import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import { fetchAllPosts } from "@/lib/blog-queries";
import Blog from "@/pages/Blog";

const DESCRIPTION =
  "Practical guides on website audits, SEO, UX, conversion and AI search visibility — written for founders who ship the fixes themselves.";

export const Route = createFileRoute("/blog/")({
  staticData: { sitemap: true },
  loader: async () => {
    const posts = await fetchAllPosts();
    return { posts };
  },
  head: ({ loaderData }) =>
    pageHead({
      path: "/blog",
      title: "Website Audit, SEO & UX Guides for Founders | SiteScoper Blog",
      description: DESCRIPTION,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "SiteScoper Blog",
          url: "https://sitescoper.com/blog",
          description: DESCRIPTION,
          publisher: { "@type": "Organization", name: "SiteScoper", url: "https://sitescoper.com/" },
          blogPost: (loaderData?.posts ?? []).slice(0, 50).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            datePublished: p.published_at,
            dateModified: p.updated_at,
            url: `https://sitescoper.com/blog/${p.slug}`,
          })),
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]),
      ],
    }),
  component: Blog,
});

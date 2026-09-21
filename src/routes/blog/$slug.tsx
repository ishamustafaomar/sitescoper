import { createFileRoute, notFound } from "@tanstack/react-router";
import BlogPost from "@/pages/BlogPost";
import { pageHead, breadcrumbLd, faqLd, DEFAULT_OG_IMAGE } from "@/lib/seo-head";
import { fetchBlogPost, fetchRelatedPosts } from "@/lib/blog-queries";

const SUFFIX = " | SiteScoper";

/**
 * The <title> must never be byte-identical to the on-page H1 (Semrush flags it
 * as over-optimisation) and must stay under 70 characters so Google doesn't
 * truncate it. Long headlines are cut at their natural colon break first.
 */
function metaTitle(headline: string): string {
  let base = headline.trim();
  if (base.length + SUFFIX.length > 70 && base.includes(": ")) {
    base = base.split(": ")[0]!.trim();
  }
  if (base.length + SUFFIX.length > 70) {
    base = base.slice(0, 70 - SUFFIX.length - 1).replace(/\s+\S*$/, "").trim();
  }
  return `${base}${SUFFIX}`;
}

export const Route = createFileRoute("/blog/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const post = await fetchBlogPost(params.slug);
    if (!post) throw notFound();
    // Category-based "related" always surfaces the same newest posts, which left
    // older guides with a single incoming link. The neighbour ring guarantees
    // every post is linked from several others.
    const [related, all] = await Promise.all([
      fetchRelatedPosts(post.slug, post.category, 3),
      fetchAllPosts(),
    ]);
    const idx = all.findIndex((p) => p.slug === post.slug);
    const ring =
      idx === -1 || all.length < 2
        ? []
        : [1, 2, 3, -1, -2, -3]
            .map((o) => all[(idx + o + all.length * 3) % all.length]!)
            .filter((p, i, arr) => p.slug !== post.slug && arr.findIndex((q) => q.slug === p.slug) === i)
            .filter((p) => !related.some((r) => r.slug === p.slug))
            .slice(0, 6);
    return { post, related, ring };
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
    const url = `https://sitescoper.com/blog/${post.slug}`;
    const jsonLd: unknown[] = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title.slice(0, 110),
        description: post.description,
        image: [DEFAULT_OG_IMAGE],
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: {
          "@type": "Person",
          name: "Omar",
          jobTitle: "Founder, SiteScoper",
          url: "https://sitescoper.com/about",
        },
        publisher: {
          "@type": "Organization",
          name: "SiteScoper",
          url: "https://sitescoper.com/",
          logo: { "@type": "ImageObject", url: "https://sitescoper.com/sitescoper-icon-v9.png" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        keywords: post.keyword,
        articleSection: post.category,
        inLanguage: "en",
        isAccessibleForFree: true,
      },
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ];
    if (post.faq.length) jsonLd.push(faqLd(post.faq));
    return pageHead({
      path: `/blog/${post.slug}`,
      title: metaTitle(post.title),
      description: post.description,
      ogType: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      jsonLd,
    });
  },
  component: BlogPost,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import { WebsiteRoastComparison } from "@/components/WebsiteRoastComparison";

export const Route = createFileRoute("/roast-my-website")({
  staticData: { sitemap: true },
  head: () => {
    const head = pageHead({
      path: "/roast-my-website",
      title: "Roast My Website: 4 Tools Compared — SiteScoper",
      description: "Compare SiteScoper, RoastFast, PageRoast and Roast My Web: free access, published offers, report formats and what to check before choosing a website roast.",
      ogType: "article",
      jsonLd: [breadcrumbLd([{ name: "SiteScoper", path: "/" }, { name: "Website roast tools compared", path: "/roast-my-website" }])],
    });
    return { ...head, meta: [...head.meta.filter((tag) => !tag.property?.startsWith("og:image") && tag.name !== "twitter:image"), { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: WebsiteRoastComparison,
});
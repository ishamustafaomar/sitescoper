import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import { faqsFrom } from "@/lib/seo-faqs";
import Compare from "@/pages/Compare";

export const Route = createFileRoute("/compare")({
  staticData: { sitemap: true },
  head: () => {
    const head = pageHead({
      path: "/compare",
      title: "Compare Websites SEO Side by Side — SiteScoper",
      description: "Compare two websites for SEO, content and UX. See an example, find competitor gaps and shared weaknesses, and prioritize fixes. Live comparisons require Pro.",
      jsonLd: [faqLd(faqsFrom("compare.seo.faq", 5, "landing")), breadcrumbLd([{ name: "SiteScoper", path: "/" }, { name: "Compare websites SEO", path: "/compare" }])],
    });
    return { ...head, meta: [...head.meta.filter((tag) => !tag.property?.startsWith("og:image") && tag.name !== "twitter:image"), { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: Compare,
});
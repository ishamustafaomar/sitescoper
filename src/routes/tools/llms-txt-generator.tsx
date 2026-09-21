import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import { llmsTxtFaq } from "@/content/tools";
import LlmsTxtGenerator from "@/pages/tools/LlmsTxtGenerator";

export const Route = createFileRoute("/tools/llms-txt-generator")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/tools/llms-txt-generator",
      title: "Free llms.txt Generator: create llms.txt for any website in seconds",
      description:
        "Generate a spec-compliant llms.txt from your sitemap and page metadata. Real titles and descriptions, grouped into sections, ready to edit, copy and upload. Free, no signup, plus a plain-English guide to what llms.txt does for SEO.",
      jsonLd: [
        faqLd(llmsTxtFaq),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Free tools", path: "/tools" },
          { name: "llms.txt generator", path: "/tools/llms-txt-generator" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "llms.txt generator",
          url: "https://sitescoper.com/tools/llms-txt-generator",
          applicationCategory: "SEO",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "SiteScoper", url: "https://sitescoper.com" },
        },
      ],
    }),
  component: LlmsTxtGenerator,
});

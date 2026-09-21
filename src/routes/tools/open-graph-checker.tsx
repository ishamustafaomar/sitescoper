import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import { openGraphFaq } from "@/content/tools";
import OpenGraphChecker from "@/pages/tools/OpenGraphChecker";

export const Route = createFileRoute("/tools/open-graph-checker")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/tools/open-graph-checker",
      title: "Free Open Graph Checker: preview & validate OG and Twitter card tags",
      description:
        "Check any URL's Open Graph, Twitter card and meta tags. See the real Facebook, LinkedIn, X, Slack and WhatsApp preview, validate image size and weight, and copy fixed head tags. Free, no signup.",
      jsonLd: [
        faqLd(openGraphFaq),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Free tools", path: "/tools" },
          { name: "Open Graph checker", path: "/tools/open-graph-checker" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Open Graph & meta tag checker",
          url: "https://sitescoper.com/tools/open-graph-checker",
          applicationCategory: "SEO",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@type": "Organization", name: "SiteScoper", url: "https://sitescoper.com" },
        },
      ],
    }),
  component: OpenGraphChecker,
});

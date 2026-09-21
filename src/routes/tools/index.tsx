import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import ToolsHub from "@/pages/tools/ToolsHub";

export const Route = createFileRoute("/tools/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/tools",
      title: "Free SEO & Website Tools — No Signup | SiteScoper",
      description:
        "Free, no-signup tools from SiteScoper: check Open Graph and Twitter card tags with real image validation, generate a spec-compliant llms.txt, and run a full AI website audit.",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Free tools", path: "/tools" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Free SEO & website tools",
          url: "https://sitescoper.com/tools",
          hasPart: [
            { "@type": "WebApplication", name: "Open Graph & meta tag checker", url: "https://sitescoper.com/tools/open-graph-checker", applicationCategory: "SEO", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
            { "@type": "WebApplication", name: "llms.txt generator", url: "https://sitescoper.com/tools/llms-txt-generator", applicationCategory: "SEO", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
          ],
        },
      ],
    }),
  component: ToolsHub,
});

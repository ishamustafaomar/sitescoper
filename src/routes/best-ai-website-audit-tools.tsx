import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import BestAiWebsiteAuditTools, { tools, faqs } from "@/pages/BestAiWebsiteAuditTools";

export const Route = createFileRoute("/best-ai-website-audit-tools")({
  head: () =>
    pageHead({
      path: "/best-ai-website-audit-tools",
      title: "Best AI Website Audit Tools in 2026 (Compared) | SiteScoper",
      description:
        "An honest comparison of AI and traditional website audit tools — SiteScoper, Lighthouse, Semrush, Ahrefs, Screaming Frog and Clarity — with pricing and what each is actually best at.",
      ogType: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Best AI website audit tools in 2026",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: tools.length,
          itemListElement: tools.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.name,
            description: t.verdict,
          })),
        },
        faqLd(faqs),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Best AI website audit tools", path: "/best-ai-website-audit-tools" },
        ]),
      ],
    }),
  component: BestAiWebsiteAuditTools,
});

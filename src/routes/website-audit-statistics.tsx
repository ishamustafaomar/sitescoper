import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import WebsiteAuditStatistics, { statSections } from "@/pages/WebsiteAuditStatistics";

const allStats = statSections.flatMap((s) => s.stats);

export const Route = createFileRoute("/website-audit-statistics")({
  head: () =>
    pageHead({
      path: "/website-audit-statistics",
      title: "Website Audit Statistics 2026 (21 Sourced Numbers) | SiteScoper",
      description:
        "Verified website audit statistics on page speed, mobile UX, SEO, conversion, accessibility and AI search — every number with a named source and year.",
      ogType: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Website audit statistics: 21 numbers worth quoting",
          description:
            "Verified statistics on page speed, mobile UX, SEO, conversion, accessibility and AI search, each with a named source.",
          author: { "@type": "Organization", name: "SiteScoper" },
          publisher: {
            "@type": "Organization",
            name: "SiteScoper",
            logo: {
              "@type": "ImageObject",
              url: "https://sitescoper.com/sitescoper-icon-v9.png",
            },
          },
          mainEntityOfPage: "https://sitescoper.com/website-audit-statistics",
          dateModified: "2026-09-01",
          citation: Array.from(new Set(allStats.map((s) => s.url))),
        },
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Website audit statistics", path: "/website-audit-statistics" },
        ]),
      ],
    }),
  component: WebsiteAuditStatistics,
});

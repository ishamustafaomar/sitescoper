import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import About from "@/pages/About";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/about",
      title: "About SiteScoper: who builds it and how audits are scored",
      description:
        "SiteScoper is a founder-built AI website audit tool. Learn who makes it, how an audit is crawled, analysed and scored across UX, SEO, conversion, performance and accessibility, and how the guides are written.",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About SiteScoper",
          url: "https://sitescoper.com/about",
          mainEntity: {
            "@type": "Organization",
            name: "SiteScoper",
            url: "https://sitescoper.com",
            logo: "https://sitescoper.com/sitescoper-icon-v9.png",
            founder: { "@type": "Person", name: "Omar", jobTitle: "Founder" },
            description: "AI website audit tool that scores UX, SEO, copy, conversion and speed and ranks the fixes by impact.",
          },
        },
      ],
    }),
  component: About,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageHead, breadcrumbLd } from "@/lib/seo-head";
import Copywriter from "@/pages/tools/Copywriter";

export const Route = createFileRoute("/tools/copywriter")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: "/tools/copywriter",
      title: "Free AI Website Copywriter: rewrite your headline from a link",
      description:
        "Paste your URL and get new headlines, a subheadline, button labels, value points and a Google title and description, written from what's on your page. First try free.",
      jsonLd: [
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Free tools", path: "/tools" },
          { name: "AI copywriter", path: "/tools/copywriter" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AI website copywriter",
          url: "https://sitescoper.com/tools/copywriter",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      ],
    }),
  component: Copywriter,
});

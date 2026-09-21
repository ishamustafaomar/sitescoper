import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import { landingPages } from "@/content/landing-pages";
import { SeoLandingPage } from "@/components/SeoLandingPage";

const content = landingPages["seo-audit-report"]!;

export const Route = createFileRoute("/seo-audit-report")({
  staticData: { sitemap: true },
  head: () =>
    pageHead({
      path: content.path,
      title: content.title,
      description: content.description,
      jsonLd: [faqLd(content.faq), breadcrumbLd([{ name: "Home", path: "/" }, { name: content.breadcrumb, path: content.path }])],
    }),
  component: () => <SeoLandingPage content={content} />,
});

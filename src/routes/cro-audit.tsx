import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd, breadcrumbLd } from "@/lib/seo-head";
import { landingPages } from "@/content/landing-pages";
import { SeoLandingPage } from "@/components/SeoLandingPage";

const content = landingPages["cro-audit"]!;

export const Route = createFileRoute("/cro-audit")({
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

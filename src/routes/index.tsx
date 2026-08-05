import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqLd } from "@/lib/seo-head";
import { faqsFrom } from "@/lib/seo-faqs";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => pageHead({ path: "/", title: "AI Website UX Auditor & Instant SEO Checker | SiteScoper", description: "SiteScoper is the AI website UX auditor and instant SEO checker founders use to find what's hurting conversions — full report in 60 seconds, free to start.", jsonLd: [faqLd(faqsFrom("landing.faq", 6, "landing"))] }),
  component: Index,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => pageHead({ path: "/", title: "AI Website UX Auditor & Instant SEO Checker | SiteScoper", description: "SiteScoper is the AI website UX auditor and instant SEO checker founders use to find what's hurting conversions — full report in 60 seconds, free to start." }),
  component: Index,
});

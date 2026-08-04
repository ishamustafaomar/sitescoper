import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import SharedAnalysis from "@/pages/SharedAnalysis";

export const Route = createFileRoute("/share/$token")({
  head: () => pageHead({ path: "/share/$token", title: 'Shared report — SiteScoper', description: 'A shared SiteScoper website audit report.', noindex: true }),
  component: SharedAnalysis,
});
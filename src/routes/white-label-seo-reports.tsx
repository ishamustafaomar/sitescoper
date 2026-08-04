import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import WhiteLabelSeoReports from "@/pages/WhiteLabelSeoReports";

export const Route = createFileRoute("/white-label-seo-reports")({
  head: () => pageHead({ path: "/white-label-seo-reports", title: "White-Label SEO Reports for Agencies | SiteScoper", description: "Deliver branded, client-ready SEO audits in minutes. White-label exports, custom logos, agency pricing." }),
  component: WhiteLabelSeoReports,
});

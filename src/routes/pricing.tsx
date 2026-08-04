import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Pricing from "@/pages/Pricing";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead({ path: "/pricing", title: "Pricing — SiteScoper", description: "Simple pricing for SiteScoper. Free audits to start, Pro plans for agencies and serious operators." }),
  component: Pricing,
});

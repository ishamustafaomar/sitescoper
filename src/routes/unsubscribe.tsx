import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Unsubscribe from "@/pages/Unsubscribe";

export const Route = createFileRoute("/unsubscribe")({
  head: () => pageHead({ path: "/unsubscribe", title: "Unsubscribe — SiteScoper", description: "Manage your SiteScoper email preferences.", noindex: true }),
  component: Unsubscribe,
});

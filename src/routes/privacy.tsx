import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead({ path: "/privacy", title: "Privacy Policy — SiteScoper", description: "How SiteScoper collects, uses, and protects your data when you analyze websites with our AI audit tool." }),
  component: Privacy,
});

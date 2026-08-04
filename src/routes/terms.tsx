import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/terms")({
  head: () => pageHead({ path: "/terms", title: "Terms of Service — SiteScoper", description: "The terms that apply when you use SiteScoper to audit and analyze websites." }),
  component: Terms,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Auth from "@/pages/Auth";

export const Route = createFileRoute("/auth")({
  head: () => pageHead({ path: "/auth", title: "Sign in — SiteScoper", description: "Sign in to SiteScoper to run AI website audits.", noindex: true }),
  component: Auth,
});

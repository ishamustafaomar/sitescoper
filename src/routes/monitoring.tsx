import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Monitoring from "@/pages/Monitoring";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/monitoring")({
  staticData: { sitemap: false },
  head: () =>
    pageHead({
      path: "/monitoring",
      title: "Website monitoring & competitor tracking — SiteScoper",
      description:
        "Watch your own pages and your competitors' pages. SiteScoper checks them on a schedule and emails you only when something meaningful changes.",
      noindex: true,
    }),
  component: () => (
    <ProtectedRoute>
      <Monitoring />
    </ProtectedRoute>
  ),
});

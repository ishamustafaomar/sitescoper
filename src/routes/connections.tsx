import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Connections from "@/pages/Connections";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/connections")({
  head: () =>
    pageHead({
      path: "/connections",
      title: "Connections — SiteScoper",
      description: "Connect SiteScoper to Slack, Google Sheets, Notion, Linear and more to push audits where your team works.",
      noindex: true,
    }),
  component: () => (
    <ProtectedRoute>
      <Connections />
    </ProtectedRoute>
  ),
});

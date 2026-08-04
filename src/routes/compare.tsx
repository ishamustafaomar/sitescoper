import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Compare from "@/pages/Compare";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/compare")({
  head: () => pageHead({ path: "/compare", title: 'Compare websites — SiteScoper', description: 'Compare two websites side-by-side with AI.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <Compare />
    </ProtectedRoute>
  ),
});
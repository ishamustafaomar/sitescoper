import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import AnalysisDetail from "@/pages/AnalysisDetail";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/analysis/$id")({
  head: () => pageHead({ path: "/analysis/$id", title: 'Analysis — SiteScoper', description: 'Your SiteScoper website analysis report.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AnalysisDetail />
    </ProtectedRoute>
  ),
});
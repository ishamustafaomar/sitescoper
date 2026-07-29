import { createFileRoute } from "@tanstack/react-router";
import AnalysisDetail from "@/pages/AnalysisDetail";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/analysis/$id")({
  component: () => (
    <ProtectedRoute>
      <AnalysisDetail />
    </ProtectedRoute>
  ),
});
import { createFileRoute } from "@tanstack/react-router";
import Compare from "@/pages/Compare";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/compare")({
  component: () => (
    <ProtectedRoute>
      <Compare />
    </ProtectedRoute>
  ),
});
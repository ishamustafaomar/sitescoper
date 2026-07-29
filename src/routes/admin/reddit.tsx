import { createFileRoute } from "@tanstack/react-router";
import AdminReddit from "@/pages/AdminReddit";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/reddit")({
  component: () => (
    <ProtectedRoute>
      <AdminReddit />
    </ProtectedRoute>
  ),
});
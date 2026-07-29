import { createFileRoute } from "@tanstack/react-router";
import AdminYoutube from "@/pages/AdminYoutube";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/youtube")({
  component: () => (
    <ProtectedRoute>
      <AdminYoutube />
    </ProtectedRoute>
  ),
});
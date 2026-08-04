import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import AdminYoutube from "@/pages/AdminYoutube";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/youtube")({
  head: () => pageHead({ path: "/admin/youtube", title: 'Admin · YouTube — SiteScoper', description: 'SiteScoper admin console.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminYoutube />
    </ProtectedRoute>
  ),
});
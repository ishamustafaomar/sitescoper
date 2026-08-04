import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import AdminReddit from "@/pages/AdminReddit";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/reddit")({
  head: () => pageHead({ path: "/admin/reddit", title: 'Admin · Reddit — SiteScoper', description: 'SiteScoper admin console.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminReddit />
    </ProtectedRoute>
  ),
});
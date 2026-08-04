import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Admin from "@/pages/Admin";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead({ path: "/admin", title: 'Admin — SiteScoper', description: 'SiteScoper admin console.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  ),
});
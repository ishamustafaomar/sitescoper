import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Onboarding from "@/pages/Onboarding";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/onboarding")({
  head: () => pageHead({ path: "/onboarding", title: 'Get started — SiteScoper', description: 'Set up your SiteScoper workspace.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <Onboarding />
    </ProtectedRoute>
  ),
});
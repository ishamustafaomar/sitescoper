import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Dashboard from "@/pages/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export const Route = createFileRoute("/dashboard")({
  head: () => pageHead({ path: "/dashboard", title: 'Dashboard — SiteScoper', description: 'Your SiteScoper website audit dashboard.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <OnboardingGuard>
        <Dashboard />
      </OnboardingGuard>
    </ProtectedRoute>
  ),
});
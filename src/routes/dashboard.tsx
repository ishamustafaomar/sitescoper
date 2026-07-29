import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <OnboardingGuard>
        <Dashboard />
      </OnboardingGuard>
    </ProtectedRoute>
  ),
});
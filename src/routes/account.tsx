import { createFileRoute } from "@tanstack/react-router";
import Account from "@/pages/Account";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account")({
  component: () => (
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  ),
});
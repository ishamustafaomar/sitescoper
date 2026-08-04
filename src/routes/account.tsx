import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import Account from "@/pages/Account";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account")({
  head: () => pageHead({ path: "/account", title: 'Account — SiteScoper', description: 'Manage your SiteScoper account and billing.', noindex: true }),
  component: () => (
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  ),
});
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo-head";
import CheckoutReturn from "@/pages/CheckoutReturn";

export const Route = createFileRoute("/checkout/return")({
  head: () => pageHead({ path: "/checkout/return", title: 'Checkout — SiteScoper', description: 'Confirming your SiteScoper subscription.', noindex: true }),
  component: CheckoutReturn,
});
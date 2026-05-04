// Use the "/pure" entry point so Stripe.js is NOT injected on import.
// It will only be loaded when getStripe() is actually called (i.e. on the
// pricing/checkout page), keeping ~240 KB and ~240 ms of script work off
// the landing page critical path.
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe } from "@stripe/stripe-js";
export { getStripeEnvironment } from "./stripeEnv";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
    stripePromise = loadStripe(clientToken);
  }
  return stripePromise;
}
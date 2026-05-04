// Use the "/pure" entry point so Stripe.js is NOT injected on import.
// It will only be loaded when getStripe() is actually called (i.e. on the
// pricing/checkout page), keeping ~240 KB and ~240 ms of script work off
// the landing page critical path.
import { loadStripe, type Stripe } from "@stripe/stripe-js/pure";

type StripeEnv = 'sandbox' | 'live';

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
const environment: StripeEnv = clientToken?.startsWith('pk_test_') ? 'sandbox' : 'live';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
    stripePromise = loadStripe(clientToken);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return environment;
}
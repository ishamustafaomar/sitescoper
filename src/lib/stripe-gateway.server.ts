// Server-only Stripe client routed through the Lovable connector gateway.
// Ported from supabase/functions/_shared/stripe.ts (Deno) to Node.
import Stripe from "stripe";

export type StripeEnv = "sandbox" | "live";

const GATEWAY_STRIPE_BASE = "https://connector-gateway.lovable.dev/stripe";

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export function getConnectionApiKey(env: StripeEnv): string {
  return env === "sandbox" ? getEnvVar("STRIPE_SANDBOX_API_KEY") : getEnvVar("STRIPE_LIVE_API_KEY");
}

export function createStripeClient(env: StripeEnv): Stripe {
  const connectionApiKey = getConnectionApiKey(env);
  const lovableApiKey = getEnvVar("LOVABLE_API_KEY");

  return new Stripe(connectionApiKey, {
    apiVersion: "2026-03-25.dahlia" as Stripe.LatestApiVersion,
    httpClient: Stripe.createFetchHttpClient(((url: string | URL, init?: RequestInit) => {
      const gatewayUrl = url.toString().replace("https://api.stripe.com", GATEWAY_STRIPE_BASE);
      return fetch(gatewayUrl, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init?.headers).entries()),
          "X-Connection-Api-Key": connectionApiKey,
          "Lovable-API-Key": lovableApiKey,
        },
      });
    }) as typeof fetch),
  });
}
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckout } from "@/lib/create-checkout.functions";
import { startFixPass } from "@/lib/fix-pass.functions";

interface Props {
  priceId: string;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
  /** When set, buys the one-time Audit & Fix Pass for this address. */
  fixPass?: { url: string; analysisId?: string };
  onError?: (code: string | null, message: string) => void;
}

export function StripeEmbeddedCheckoutForm({ priceId, customerEmail, userId, returnUrl, fixPass, onError }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const url = returnUrl || `${window.location.origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    try {
      const data = fixPass
        ? await startFixPass({
            data: {
              url: fixPass.url,
              analysisId: fixPass.analysisId,
              returnUrl: url,
              environment: getStripeEnvironment(),
            },
          })
        : await createCheckout({
            data: { priceId, returnUrl: url, environment: getStripeEnvironment() },
          });
      const errCode = data?.error ?? null;
      if (errCode || !data?.clientSecret) {
        const msg = errCode || "Failed to create checkout session";
        onError?.(errCode, msg);
        throw new Error(msg);
      }
      return data.clientSecret;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create checkout session";
      onError?.(null, msg);
      throw e;
    }
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckout } from "@/lib/create-checkout.functions";

interface Props {
  priceId: string;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
  onError?: (code: string | null, message: string) => void;
}

export function StripeEmbeddedCheckoutForm({ priceId, customerEmail, userId, returnUrl, onError }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const url = returnUrl || `${window.location.origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    try {
      const data = await createCheckout({
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
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, customerEmail, userId, returnUrl: url, environment: getStripeEnvironment() },
    });
    const errCode = (data && typeof data === "object" && "error" in data) ? (data as any).error as string : null;
    if (errCode || error || !data?.clientSecret) {
      const msg = errCode || error?.message || "Failed to create checkout session";
      onError?.(errCode, msg);
      throw new Error(msg);
    }
    return data.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
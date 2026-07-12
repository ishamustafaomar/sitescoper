import { createStripeClient, getConnectionApiKey } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "FRIEND80";
  const env = (url.searchParams.get("env") || "live") as "sandbox" | "live";
  const stripe = createStripeClient(env);
  try {
    const coupon = await stripe.coupons.create({
      percent_off: 80,
      duration: "forever",
      name: "80% off (private)",
      max_redemptions: 1,
    });
    // Fall back to raw REST for promotion code (SDK typing issue on dahlia)
    const connectionKey = getConnectionApiKey(env);
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const form = new URLSearchParams();
    form.set("coupon", coupon.id);
    form.set("code", code);
    form.set("max_redemptions", "1");
    const res = await fetch("https://connector-gateway.lovable.dev/stripe/v1/promotion_codes", {
      method: "POST",
      headers: {
        "X-Connection-Api-Key": connectionKey,
        "Lovable-API-Key": lovableKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const promo = await res.json();
    return new Response(JSON.stringify({ promo, coupon: coupon.id, env }, null, 2), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
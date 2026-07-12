import { createStripeClient } from "../_shared/stripe.ts";

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
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      max_redemptions: 1,
    });
    return new Response(JSON.stringify({ code: promo.code, id: promo.id, coupon: coupon.id, env }, null, 2), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "content-type": "application/json" } });
  }
});
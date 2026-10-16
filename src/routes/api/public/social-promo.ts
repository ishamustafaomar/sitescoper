import { createFileRoute } from "@tanstack/react-router";
import { buildPromoPrompt, promoSize } from "@/lib/social-promo";

export const Route = createFileRoute("/api/public/social-promo")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireSupabaseAuth } = await import("@/lib/supabase.server");
        try { await requireSupabaseAuth(); } catch {
          return Response.json({ error: { message: "Sign in to create promotional images." } }, { status: 401 });
        }
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return Response.json({ error: { message: "Image generation is not configured." } }, { status: 503 });
        const form = await request.formData();
        let image = form.get("image");
        const imageUrl = form.get("imageUrl");
        if (!(image instanceof File) && typeof imageUrl === "string" && imageUrl) {
          image = await fetchRemoteImage(imageUrl);
          if (!image) return Response.json({ error: { message: "That website photo couldn't be used. Pick another or upload a PNG, JPEG or WebP image." } }, { status: 400 });
        }
        if (!(image instanceof File) || !["image/png", "image/jpeg", "image/webp"].includes(image.type) || image.size > 10 * 1024 * 1024 || image.size === 0) {
          return Response.json({ error: { message: "Choose a PNG, JPEG or WebP image under 10 MB." } }, { status: 400 });
        }
        const field = (key: string, max: number) => String(form.get(key) ?? "").slice(0, max).trim();
        const style = field("style", 20);
        const format = field("format", 20);
        if (!["photo", "poster", "collage"].includes(style) || !["square", "story"].includes(format)) return new Response(null, { status: 400 });
        const brand = field("brand", 100);
        const headline = field("headline", 160);
        if (!brand || !headline) return Response.json({ error: { message: "Add a business name and headline." } }, { status: 400 });
        const payload = new FormData();
        payload.set("model", "openai/gpt-image-2.5-sunburst");
        payload.set("image", image);
        payload.set("prompt", buildPromoPrompt({ brand, headline, detail: field("detail", 240), context: field("context", 10000), style: style === "poster" ? "poster" : style === "collage" ? "collage" : "photo" }));
        payload.set("size", promoSize(format === "story" ? "story" : "square"));
        payload.set("quality", "high");
        if (form.get("stream") !== "false") {
          payload.set("stream", "true");
          payload.set("partial_images", "1");
        }
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/edits", {
          method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: payload,
        });
        return new Response(upstream.body, { status: upstream.status, headers: {
          "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-store",
        } });
      },
    },
  },
});
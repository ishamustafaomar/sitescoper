// Dynamic sitemap.xml — includes every blog post in the database so
// new auto-generated posts get discovered without a redeploy.
// Public (no JWT). robots.txt points at /functions/v1/sitemap-xml.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const BASE_URL = "https://sitescoper.com";

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "weekly", priority: "0.8" },
  { path: "/ai-website-audit-tool", changefreq: "monthly", priority: "0.9" },
  { path: "/white-label-seo-reports", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/compare", changefreq: "monthly", priority: "0.7" },
  { path: "/auth", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts } = await sb
      .from("blog_posts")
      .select("slug, published_at")
      .order("published_at", { ascending: false });

    const entries = [
      ...STATIC_ROUTES.map((r) => ({ loc: `${BASE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority, lastmod: undefined as string | undefined })),
      ...((posts ?? []).map((p) => ({
        loc: `${BASE_URL}/blog/${p.slug}`,
        changefreq: "monthly",
        priority: "0.7",
        lastmod: new Date(p.published_at).toISOString().slice(0, 10),
      }))),
    ];

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries.map((e) =>
        [
          "  <url>",
          `    <loc>${e.loc}</loc>`,
          e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
          `    <changefreq>${e.changefreq}</changefreq>`,
          `    <priority>${e.priority}</priority>`,
          "  </url>",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      "</urlset>",
    ].join("\n");

    return new Response(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(`<!-- sitemap error: ${msg} -->`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
});

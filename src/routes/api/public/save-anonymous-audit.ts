import { createFileRoute } from "@tanstack/react-router";

/**
 * Stores the result of a free, no-account audit for 24 hours so it can be
 * attached to an account if the visitor signs up. The caller is verified by
 * matching the browser session id against a recently recorded free scrape.
 */
export const Route = createFileRoute("/api/public/save-anonymous-audit")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const anonSession = (request.headers.get("x-anon-session") || "").trim();
          if (anonSession.length < 16 || anonSession.length > 100) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from("anon_scan_usage")
            .select("*", { count: "exact", head: true })
            .eq("session_id", anonSession)
            .gte("created_at", since);
          if ((count ?? 0) === 0) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const { count: existing } = await supabaseAdmin
            .from("anonymous_audits")
            .select("*", { count: "exact", head: true })
            .eq("session_id", anonSession)
            .is("claimed_by", null);
          if ((existing ?? 0) >= 1) {
            return Response.json({ success: true, skipped: true });
          }

          const body = (await request.json()) as {
            url?: string;
            overall_score?: number;
            summary?: string;
            categories?: unknown;
            scrape_data?: unknown;
            custom_instructions?: string;
          };

          if (!body?.url || typeof body.url !== "string" || typeof body.overall_score !== "number") {
            return Response.json({ error: "Invalid payload" }, { status: 400 });
          }

          const { error } = await supabaseAdmin.from("anonymous_audits").insert({
            session_id: anonSession,
            url: body.url.slice(0, 2048),
            overall_score: body.overall_score,
            summary: typeof body.summary === "string" ? body.summary : null,
            categories: (body.categories ?? []) as never,
            scrape_data: (body.scrape_data ?? null) as never,
            custom_instructions: body.custom_instructions?.trim() || null,
          });
          if (error) throw error;

          return Response.json({ success: true });
        } catch (e) {
          console.error("save-anonymous-audit failed", e);
          return Response.json({ error: "Failed to store audit" }, { status: 500 });
        }
      },
    },
  },
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const USER_AGENT = "sitescoper-growth-bot/0.1 by /u/sitescoper";

async function getRedditToken() {
  const id = Deno.env.get("REDDIT_CLIENT_ID");
  const secret = Deno.env.get("REDDIT_CLIENT_SECRET");
  const user = Deno.env.get("REDDIT_USERNAME");
  const pass = Deno.env.get("REDDIT_PASSWORD");
  if (!id || !secret || !user || !pass) return null;
  const basic = btoa(`${id}:${secret}`);
  const body = new URLSearchParams({ grant_type: "password", username: user, password: pass });
  const r = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) return null;
  return (await r.json()).access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = await getRedditToken();

    // Fetch posts from last 14 days that are posted (not failed/draft)
    const since = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
    const { data: posts } = await supabase
      .from("reddit_posts")
      .select("*")
      .eq("status", "posted")
      .gte("posted_at", since);

    const results: any[] = [];
    for (const post of posts || []) {
      let score = 0, comments = 0, removed = false, removedBy: string | null = null;

      if (token && post.reddit_post_id) {
        const fullName = post.reddit_post_id.startsWith("t3_") ? post.reddit_post_id : `t3_${post.reddit_post_id}`;
        const r = await fetch(`https://oauth.reddit.com/api/info?id=${fullName}`, {
          headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT },
        });
        if (r.ok) {
          const j = await r.json();
          const child = j?.data?.children?.[0]?.data;
          if (child) {
            score = child.score ?? 0;
            comments = child.num_comments ?? 0;
            removedBy = child.removed_by_category ?? null;
            removed = !!removedBy || child.removed === true;
          }
        }
      }

      // Signups attributed: users who signed up within 48h of post and where first analysis_history used this UTM (best-effort: just count signups in window)
      const postedAt = new Date(post.posted_at).getTime();
      const windowEnd = new Date(postedAt + 48 * 3600 * 1000).toISOString();
      const { count: signups } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", post.posted_at)
        .lte("created_at", windowEnd);

      await supabase.from("reddit_post_metrics").insert({
        post_id: post.id, score, num_comments: comments, signups_attributed: signups ?? 0, removed, removed_by_category: removedBy,
      });

      if (removed && post.status !== "removed") {
        await supabase.from("reddit_posts").update({ status: "removed", failure_reason: removedBy }).eq("id", post.id);
        // Burn the subreddit
        const { data: poolRow } = await supabase.from("reddit_subreddit_pool").select("*").eq("subreddit", post.subreddit).maybeSingle();
        if (poolRow) {
          await supabase.from("reddit_subreddit_pool").update({
            status: "burned",
            burn_reason: removedBy || "removed",
            removals_count: (poolRow.removals_count || 0) + 1,
          }).eq("id", poolRow.id);
        }
      } else {
        // Update pool aggregates
        const { data: poolRow } = await supabase.from("reddit_subreddit_pool").select("*").eq("subreddit", post.subreddit).maybeSingle();
        if (poolRow) {
          await supabase.from("reddit_subreddit_pool").update({
            total_signups: (poolRow.total_signups || 0) + (signups ?? 0),
            avg_score: ((poolRow.avg_score || 0) + score) / 2,
          }).eq("id", poolRow.id);
        }
      }

      results.push({ post: post.id, subreddit: post.subreddit, score, comments, removed, signups });
    }

    return new Response(JSON.stringify({ checked: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("reddit-analytics error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
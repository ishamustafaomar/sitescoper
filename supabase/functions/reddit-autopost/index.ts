import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://sitescoper.com";
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
  const j = await r.json();
  return j.access_token as string;
}

async function draftPost(siteContext: string, subreddit: string, topPatterns: string[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const prompt = `You are an indie hacker who built SiteScoper (a free AI website auditor). Draft a Reddit post for r/${subreddit}.

SITE CONTEXT:
${siteContext}

TOP-PERFORMING TITLE PATTERNS (use one if it fits, otherwise invent):
${topPatterns.join("\n") || "(none yet)"}

RULES:
- Sound like a real person, not marketing. No emojis. No exclamation marks. No "Hey everyone!".
- Lead with a problem or finding, not the product.
- Mention SiteScoper at most once, near the end, as a tool you built.
- Body 80-180 words.
- Output strict JSON: {"title": "...", "body": "..."}`;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) throw new Error(`AI ${r.status}`);
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return { title: String(parsed.title || "").slice(0, 290), body: String(parsed.body || "") };
}

async function pickSubreddits(siteContext: string): Promise<string[]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return [];
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: `Given this product context, list 8 subreddits where a candid post about it could legitimately fit (no spam-only subs, no banned-self-promo subs). Return JSON {"subreddits": ["name without r/"]}.\n\nCONTEXT:\n${siteContext}` }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) return [];
  const j = await r.json();
  try {
    const parsed = JSON.parse(j.choices?.[0]?.message?.content || "{}");
    return (parsed.subreddits || []).map((s: string) => s.replace(/^r\//, "").trim()).filter(Boolean);
  } catch { return []; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 0. Safety: pause if 2+ removals in last 24h
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count: recentRemovals } = await supabase.from("reddit_posts").select("*", { count: "exact", head: true }).eq("status", "removed").gte("updated_at", since);
    if ((recentRemovals ?? 0) >= 2) {
      return new Response(JSON.stringify({ skipped: "cooldown", recentRemovals }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Site context (hardcoded snapshot + can be extended to read live)
    const siteContext = `SiteScoper: a free AI-powered website audit tool. Scans any URL and returns a 100-point score plus specific, prioritized findings across conversion, SEO, design, performance, and trust. Currently 100% free during early access. Built for indie hackers and small SaaS founders.`;

    // 2. Refresh pool with new candidates (don't replace burned)
    const candidates = await pickSubreddits(siteContext);
    for (const sub of candidates) {
      await supabase.from("reddit_subreddit_pool").upsert({ subreddit: sub }, { onConflict: "subreddit", ignoreDuplicates: true });
    }

    // 3. Pick best active subreddit (highest signups per post, then least recently used)
    const { data: pool } = await supabase
      .from("reddit_subreddit_pool")
      .select("*")
      .eq("status", "active")
      .order("total_signups", { ascending: false })
      .order("last_post_at", { ascending: true, nullsFirst: true })
      .limit(10);
    if (!pool || pool.length === 0) {
      return new Response(JSON.stringify({ skipped: "no_active_subs" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Skip ones posted in last 3 days
    const threeDays = Date.now() - 3 * 86400 * 1000;
    const eligible = pool.filter((p: any) => !p.last_post_at || new Date(p.last_post_at).getTime() < threeDays);
    const pick = (eligible[0] || pool[0]) as any;

    // 4. Top-performing title patterns
    const { data: topPosts } = await supabase
      .from("reddit_posts")
      .select("title, reddit_post_metrics(score, signups_attributed)")
      .eq("status", "posted")
      .limit(20);
    const patterns = (topPosts || []).map((p: any) => p.title).slice(0, 5);

    // 5. Draft
    const draft = await draftPost(siteContext, pick.subreddit, patterns);
    const utmCampaign = `rd_${Date.now()}_${pick.subreddit}`.slice(0, 60);
    const url = `${SITE_URL}/?utm_source=reddit&utm_medium=social&utm_campaign=${encodeURIComponent(utmCampaign)}`;

    // 6. Insert as draft
    const { data: postRow, error: insErr } = await supabase.from("reddit_posts").insert({
      subreddit: pick.subreddit,
      title: draft.title,
      body: `${draft.body}\n\n${url}`,
      url,
      utm_campaign: utmCampaign,
      status: "draft",
    }).select().single();
    if (insErr) throw insErr;

    // 7. Try to post via Reddit API
    const token = await getRedditToken();
    if (!token) {
      return new Response(JSON.stringify({ drafted: postRow, posted: false, reason: "no_reddit_credentials" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const submitBody = new URLSearchParams({
      sr: pick.subreddit, kind: "self", title: draft.title, text: `${draft.body}\n\n${url}`, api_type: "json",
    });
    const submit = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
      body: submitBody,
    });
    const submitJson = await submit.json();
    const errors = submitJson?.json?.errors || [];
    if (!submit.ok || errors.length > 0) {
      await supabase.from("reddit_posts").update({ status: "failed", failure_reason: JSON.stringify(errors).slice(0, 500) }).eq("id", postRow.id);
      await supabase.from("reddit_subreddit_pool").update({ removals_count: (pick.removals_count || 0) + 1 }).eq("id", pick.id);
      return new Response(JSON.stringify({ posted: false, errors }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const redditPostId = submitJson?.json?.data?.id || submitJson?.json?.data?.name;
    const permalink = submitJson?.json?.data?.url;
    await supabase.from("reddit_posts").update({
      status: "posted",
      reddit_post_id: redditPostId,
      reddit_permalink: permalink,
      posted_at: new Date().toISOString(),
    }).eq("id", postRow.id);
    await supabase.from("reddit_subreddit_pool").update({
      last_post_at: new Date().toISOString(),
      posts_count: (pick.posts_count || 0) + 1,
    }).eq("id", pick.id);

    return new Response(JSON.stringify({ posted: true, postId: postRow.id, redditPostId, permalink }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("reddit-autopost error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
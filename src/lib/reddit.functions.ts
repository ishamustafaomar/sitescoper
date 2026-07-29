// Migrated from supabase/functions/reddit-autopost and reddit-analytics (Deno edge functions).
// Both are admin-only tools triggered from /admin/reddit.
import { createServerFn } from "@tanstack/react-start";

const SITE_URL = "https://sitescoper.com";
const COMPOSIO_BASE = "https://backend.composio.dev/api/v3";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function composioExecute(toolSlug: string, args: Record<string, unknown>, throwOnMissing: boolean) {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) {
    if (throwOnMissing) throw new Error("COMPOSIO_API_KEY missing");
    return null;
  }
  const userId = process.env.COMPOSIO_USER_ID || "default";
  const r = await fetch(`${COMPOSIO_BASE}/tools/execute/${toolSlug}`, {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, arguments: args }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || j?.successful === false || (throwOnMissing && j?.error)) {
    if (throwOnMissing) throw new Error(`composio ${toolSlug} ${r.status}: ${JSON.stringify(j).slice(0, 500)}`);
    return null;
  }
  return j?.data ?? j;
}

async function draftPost(siteContext: string, subreddit: string, topPatterns: string[]) {
  const key = process.env.LOVABLE_API_KEY;
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
  const j: any = await r.json();
  const content = j.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return { title: String(parsed.title || "").slice(0, 290), body: String(parsed.body || "") };
}

async function pickSubreddits(siteContext: string): Promise<string[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return [];
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: `Given this product context, list 8 subreddits where a candid post about it could legitimately fit (no spam-only subs, no banned-self-promo subs). Return JSON {"subreddits": ["name without r/"]}.\n\nCONTEXT:\n${siteContext}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) return [];
  const j: any = await r.json();
  try {
    const parsed = JSON.parse(j.choices?.[0]?.message?.content || "{}");
    return (parsed.subreddits || []).map((s: string) => s.replace(/^r\//, "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export const redditAutopost = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin, adminClient } = await import("@/lib/supabase.server");
  await requireAdmin();
  const supabase = adminClient();

  // 0. Safety: pause if 2+ removals in last 24h
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: recentRemovals } = await supabase
    .from("reddit_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "removed")
    .gte("updated_at", since);
  if ((recentRemovals ?? 0) >= 2) {
    return { skipped: "cooldown", recentRemovals };
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
    return { skipped: "no_active_subs" };
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
  const { data: postRow, error: insErr } = await supabase
    .from("reddit_posts")
    .insert({
      subreddit: pick.subreddit,
      title: draft.title,
      body: `${draft.body}\n\n${url}`,
      url,
      utm_campaign: utmCampaign,
      status: "draft",
    })
    .select()
    .single();
  if (insErr) throw insErr;

  // 7. Post via Composio
  if (!process.env.COMPOSIO_API_KEY) {
    return { drafted: postRow, posted: false, reason: "no_composio_api_key" };
  }
  let submitResp: any;
  try {
    submitResp = await composioExecute(
      "REDDIT_CREATE_REDDIT_POST",
      { subreddit: pick.subreddit, title: draft.title, text: `${draft.body}\n\n${url}`, kind: "self" },
      true,
    );
  } catch (e: any) {
    await supabase.from("reddit_posts").update({ status: "failed", failure_reason: String(e.message).slice(0, 500) }).eq("id", postRow.id);
    await supabase.from("reddit_subreddit_pool").update({ removals_count: (pick.removals_count || 0) + 1 }).eq("id", pick.id);
    return { posted: false, error: e.message };
  }

  // Composio response shape: response_data.json.data.{id,name,url} (mirrors Reddit) — fall back to top-level keys
  const rd = submitResp?.response_data?.json?.data ?? submitResp?.json?.data ?? submitResp?.data ?? submitResp ?? {};
  const redditPostId = rd.id || rd.name || rd.post_id;
  const permalink = rd.url || rd.permalink;
  await supabase
    .from("reddit_posts")
    .update({ status: "posted", reddit_post_id: redditPostId, reddit_permalink: permalink, posted_at: new Date().toISOString() })
    .eq("id", postRow.id);
  await supabase
    .from("reddit_subreddit_pool")
    .update({ last_post_at: new Date().toISOString(), posts_count: (pick.posts_count || 0) + 1 })
    .eq("id", pick.id);

  return { posted: true, postId: postRow.id, redditPostId, permalink };
});

export const redditAnalytics = createServerFn({ method: "POST" }).handler(async () => {
  const { requireAdmin, adminClient } = await import("@/lib/supabase.server");
  await requireAdmin();
  const supabase = adminClient();

  // Fetch posts from last 14 days that are posted (not failed/draft)
  const since = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
  const { data: posts } = await supabase.from("reddit_posts").select("*").eq("status", "posted").gte("posted_at", since);

  const results: any[] = [];
  for (const post of posts || []) {
    let score = 0,
      comments = 0,
      removed = false,
      removedBy: string | null = null;

    if (post.reddit_post_id) {
      const fullName = post.reddit_post_id.startsWith("t3_") ? post.reddit_post_id : `t3_${post.reddit_post_id}`;
      const resp: any = await composioExecute("REDDIT_RETRIEVE_POST", { article: fullName }, false);
      const child = resp?.response_data?.data?.children?.[0]?.data ?? resp?.data?.children?.[0]?.data ?? resp?.children?.[0]?.data ?? null;
      if (child) {
        score = child.score ?? 0;
        comments = child.num_comments ?? 0;
        removedBy = child.removed_by_category ?? null;
        removed = !!removedBy || child.removed === true;
      }
    }

    // Signups attributed: users who signed up within 48h of post (best-effort: just count signups in window)
    const postedAt = new Date(post.posted_at).getTime();
    const windowEnd = new Date(postedAt + 48 * 3600 * 1000).toISOString();
    const { count: signups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", post.posted_at)
      .lte("created_at", windowEnd);

    await supabase.from("reddit_post_metrics").insert({
      post_id: post.id,
      score,
      num_comments: comments,
      signups_attributed: signups ?? 0,
      removed,
      removed_by_category: removedBy,
    });

    if (removed && post.status !== "removed") {
      await supabase.from("reddit_posts").update({ status: "removed", failure_reason: removedBy }).eq("id", post.id);
      // Burn the subreddit
      const { data: poolRow } = await supabase.from("reddit_subreddit_pool").select("*").eq("subreddit", post.subreddit).maybeSingle();
      if (poolRow) {
        await supabase
          .from("reddit_subreddit_pool")
          .update({ status: "burned", burn_reason: removedBy || "removed", removals_count: (poolRow.removals_count || 0) + 1 })
          .eq("id", poolRow.id);
      }
    } else {
      // Update pool aggregates
      const { data: poolRow } = await supabase.from("reddit_subreddit_pool").select("*").eq("subreddit", post.subreddit).maybeSingle();
      if (poolRow) {
        await supabase
          .from("reddit_subreddit_pool")
          .update({
            total_signups: (poolRow.total_signups || 0) + (signups ?? 0),
            avg_score: ((poolRow.avg_score || 0) + score) / 2,
          })
          .eq("id", poolRow.id);
      }
    }

    results.push({ post: post.id, subreddit: post.subreddit, score, comments, removed, signups });
  }

  return { checked: results.length, results };
});
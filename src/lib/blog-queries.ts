import { supabase } from "@/integrations/supabase/client";

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPostRow {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  reading_time: string;
  published_at: string;
  updated_at: string;
  category: string;
  author: string;
  faq: BlogFaq[];
  body: string;
}

export interface BlogListRow {
  slug: string;
  title: string;
  description: string;
  reading_time: string;
  published_at: string;
  updated_at: string;
  category: string;
}

export const BLOG_CATEGORIES: Record<string, string> = {
  guides: "Guides",
  seo: "SEO",
  ux: "UX & conversion",
  performance: "Performance",
  "ai-search": "AI search",
  agencies: "Agencies",
};

const LIST_COLUMNS = "slug, title, description, reading_time, published_at, updated_at, category";

function normaliseFaq(raw: unknown): BlogFaq[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => (f && typeof f === "object" ? (f as Record<string, unknown>) : null))
    .filter((f): f is Record<string, unknown> => !!f && typeof f.q === "string" && typeof f.a === "string")
    .map((f) => ({ q: String(f.q), a: String(f.a) }));
}

/** Full published post by slug (public read). */
export async function fetchBlogPost(slug: string): Promise<BlogPostRow | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, description, keyword, reading_time, published_at, updated_at, category, author, faq, body")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, faq: normaliseFaq(data.faq) } as BlogPostRow;
}

/** Up to `limit` other published posts, same category first, newest first. */
export async function fetchRelatedPosts(slug: string, category: string, limit = 3): Promise<BlogListRow[]> {
  const { data: same, error } = await supabase
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const picked = (same ?? []) as BlogListRow[];
  if (picked.length >= limit) return picked;
  const { data: rest, error: restErr } = await supabase
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .neq("slug", slug)
    .neq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit - picked.length);
  if (restErr) throw restErr;
  return [...picked, ...((rest ?? []) as BlogListRow[])];
}

/** Every published post, newest first. Pages through the table so the list never truncates. */
export async function fetchAllPosts(): Promise<BlogListRow[]> {
  const pageSize = 500;
  const out: BlogListRow[] = [];
  for (let offset = 0; ; ) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("slug", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...(data as BlogListRow[]));
    if (data.length < pageSize) break;
    offset += data.length;
  }
  return out;
}

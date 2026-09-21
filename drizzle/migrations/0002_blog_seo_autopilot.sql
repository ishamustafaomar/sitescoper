-- Blog posts: editorial metadata for SEO (freshness, FAQ schema, publish state)
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'guides',
  ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT 'Omar, founder of SiteScoper',
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'editorial';

ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published', 'archived'));

-- Backfill: existing rows were last touched when published.
UPDATE public.blog_posts SET updated_at = published_at WHERE updated_at > published_at AND updated_at > now() - interval '1 minute';

CREATE OR REPLACE FUNCTION public.set_blog_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body OR NEW.title IS DISTINCT FROM OLD.title OR NEW.description IS DISTINCT FROM OLD.description OR NEW.faq IS DISTINCT FROM OLD.faq THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_blog_posts_updated_at();

CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx ON public.blog_posts (status, published_at DESC);

-- Only published posts are publicly readable.
DROP POLICY IF EXISTS "Blog posts are publicly readable" ON public.blog_posts;
CREATE POLICY "Published blog posts are publicly readable"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;

-- SEO autopilot topic queue (server-side only)
CREATE TABLE IF NOT EXISTS public.seo_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL UNIQUE,
  angle text NOT NULL DEFAULT '',
  intent text NOT NULL DEFAULT 'informational',
  priority integer NOT NULL DEFAULT 50,
  monthly_volume integer,
  difficulty integer,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'writing', 'done', 'skipped')),
  post_slug text,
  last_error text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz
);

GRANT ALL ON public.seo_topics TO service_role;
GRANT SELECT ON public.seo_topics TO authenticated;
ALTER TABLE public.seo_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read seo topics"
  ON public.seo_topics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Autopilot run log (what was published/refreshed and why)
CREATE TABLE IF NOT EXISTS public.seo_autopilot_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  keyword text,
  post_slug text,
  words integer,
  ok boolean NOT NULL DEFAULT true,
  detail text
);

GRANT ALL ON public.seo_autopilot_runs TO service_role;
GRANT SELECT ON public.seo_autopilot_runs TO authenticated;
ALTER TABLE public.seo_autopilot_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read autopilot runs"
  ON public.seo_autopilot_runs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed the queue with researched, low-difficulty targets (US volume / difficulty from Semrush, Sep 2026)
INSERT INTO public.seo_topics (keyword, angle, intent, priority, monthly_volume, difficulty) VALUES
  ('what is a ux audit', 'plain-English definition, what it covers, how long it takes, how to do one yourself in an afternoon, what a good deliverable looks like', 'informational', 95, 140, 20),
  ('cro audit checklist', '32-point conversion audit checklist grouped by page type (homepage, pricing, signup, checkout), with the why behind each check', 'informational', 94, 70, 20),
  ('seo audit report', 'what a useful SEO audit report contains, annotated example structure, what to ignore, how to hand it to a developer', 'commercial', 92, 2900, 45),
  ('website design audit', 'how to audit visual hierarchy, consistency, typography, spacing and trust signals; a scoring rubric', 'informational', 90, 390, 25),
  ('ux audit template', 'a copy-paste UX audit template with sections, severity scale and example findings', 'informational', 88, 320, 25),
  ('how to do a website content audit', 'inventory, scoring, keep/rewrite/kill decisions, with a spreadsheet structure', 'informational', 85, 140, 20),
  ('ecommerce cro audit', 'product page, cart and checkout audit for Shopify/WooCommerce stores, with benchmarks', 'commercial', 84, 260, 22),
  ('technical seo audit', 'crawlability, indexability, rendering, Core Web Vitals, structured data: a founder-level technical audit', 'informational', 82, 5400, 55),
  ('homepage audit', 'how to audit a homepage above the fold: headline, CTA, proof, navigation; a 10-minute method', 'informational', 80, 90, 15),
  ('saas website audit', 'what to audit on a SaaS marketing site: positioning, pricing page, signup friction, docs discoverability', 'commercial', 79, 70, 15),
  ('what is llms.txt', 'the llms.txt proposal explained, who supports it, whether it helps SEO or AI visibility, and how to write one', 'informational', 78, 1000, 40),
  ('open graph tags', 'complete guide to og:title, og:description, og:image (sizes), og:url, twitter:card, with copy-paste examples and validation', 'informational', 77, 1900, 40),
  ('website accessibility audit', 'WCAG 2.2 quick audit any founder can run: contrast, keyboard, alt text, forms, focus states', 'informational', 75, 880, 45),
  ('landing page checklist', 'a pre-launch landing page checklist covering message, proof, CTA, speed, tracking', 'informational', 74, 480, 35),
  ('conversion rate optimization audit', 'how agencies structure a CRO audit and how to do a lean version in a day', 'commercial', 73, 390, 25),
  ('how to check if a website is mobile friendly', 'the tests that matter in 2026 now that Google retired the mobile-friendly test', 'informational', 70, 320, 30),
  ('above the fold best practices', 'what belongs above the fold on a SaaS homepage, with examples and common mistakes', 'informational', 68, 210, 30),
  ('website audit for small business', 'a low-cost audit routine for local and small businesses: what to check quarterly', 'commercial', 66, 170, 25),
  ('ai crawlability audit', 'how to check whether ChatGPT, Perplexity and Google AI Overviews can read and cite your site', 'informational', 65, 50, 15),
  ('pricing page audit', 'how to audit a SaaS pricing page: anchoring, plan naming, FAQ, trust, and common conversion leaks', 'informational', 64, 40, 10)
ON CONFLICT (keyword) DO NOTHING;

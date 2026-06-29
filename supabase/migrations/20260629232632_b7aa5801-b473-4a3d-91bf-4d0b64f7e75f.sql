
CREATE TABLE public.reddit_subreddit_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','burned','cooling')),
  burn_reason TEXT,
  last_post_at TIMESTAMPTZ,
  posts_count INT NOT NULL DEFAULT 0,
  removals_count INT NOT NULL DEFAULT 0,
  total_signups INT NOT NULL DEFAULT 0,
  avg_score NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reddit_subreddit_pool TO authenticated;
GRANT ALL ON public.reddit_subreddit_pool TO service_role;
ALTER TABLE public.reddit_subreddit_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view pool" ON public.reddit_subreddit_pool FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_reddit_pool_updated BEFORE UPDATE ON public.reddit_subreddit_pool FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reddit_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  reddit_post_id TEXT,
  reddit_permalink TEXT,
  utm_campaign TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','removed','failed')),
  failure_reason TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reddit_posts TO authenticated;
GRANT ALL ON public.reddit_posts TO service_role;
ALTER TABLE public.reddit_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view posts" ON public.reddit_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_reddit_posts_updated BEFORE UPDATE ON public.reddit_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_reddit_posts_utm ON public.reddit_posts(utm_campaign);
CREATE INDEX idx_reddit_posts_posted_at ON public.reddit_posts(posted_at DESC);

CREATE TABLE public.reddit_post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.reddit_posts(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  num_comments INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  signups_attributed INT NOT NULL DEFAULT 0,
  removed BOOLEAN NOT NULL DEFAULT FALSE,
  removed_by_category TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reddit_post_metrics TO authenticated;
GRANT ALL ON public.reddit_post_metrics TO service_role;
ALTER TABLE public.reddit_post_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view metrics" ON public.reddit_post_metrics FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_reddit_metrics_post ON public.reddit_post_metrics(post_id, checked_at DESC);

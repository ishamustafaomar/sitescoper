ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
DROP TABLE IF EXISTS public.subscribers CASCADE;

CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscribers FOR SELECT
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription"
  ON public.subscribers FOR UPDATE
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert their own subscription"
  ON public.subscribers FOR INSERT
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscribers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

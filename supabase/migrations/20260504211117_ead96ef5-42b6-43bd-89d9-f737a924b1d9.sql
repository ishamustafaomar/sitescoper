-- Grant complimentary lifetime Pro subscription to adeecom29@gmail.com
DO $$
DECLARE
  target_user_id uuid := '9aa512ec-75c0-4511-9440-945069959c9c';
BEGIN
  -- Sandbox environment
  INSERT INTO public.subscriptions (
    user_id,
    status,
    price_id,
    product_id,
    current_period_end,
    cancel_at_period_end,
    environment
  ) VALUES (
    target_user_id,
    'active',
    'pro_monthly',
    'pro_plan',
    now() + interval '100 years',
    false,
    'sandbox'
  )
  ON CONFLICT DO NOTHING;

  -- Live environment
  INSERT INTO public.subscriptions (
    user_id,
    status,
    price_id,
    product_id,
    current_period_end,
    cancel_at_period_end,
    environment
  ) VALUES (
    target_user_id,
    'active',
    'pro_monthly',
    'pro_plan',
    now() + interval '100 years',
    false,
    'live'
  )
  ON CONFLICT DO NOTHING;
END $$;
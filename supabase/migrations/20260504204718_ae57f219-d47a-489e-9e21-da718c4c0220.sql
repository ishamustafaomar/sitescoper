INSERT INTO public.subscriptions (user_id, environment, status, price_id, current_period_end, cancel_at_period_end)
SELECT u.id, 'live', 'active', 'pro_monthly', (now() + interval '100 years'), false
FROM auth.users u
WHERE u.email = 'omarmlaptop@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.subscriptions (user_id, environment, status, price_id, current_period_end, cancel_at_period_end)
SELECT u.id, 'sandbox', 'active', 'pro_monthly', (now() + interval '100 years'), false
FROM auth.users u
WHERE u.email = 'omarmlaptop@gmail.com'
ON CONFLICT DO NOTHING;
CREATE TABLE public.page_visits (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 visited_at timestamptz NOT NULL DEFAULT now(),
 path text NOT NULL,
 utm_source text NOT NULL DEFAULT 'direct',
 utm_medium text NOT NULL DEFAULT 'none',
 utm_campaign text,
 referrer text,
 session_id uuid NOT NULL,
 user_id uuid,
 UNIQUE (session_id, path)
);
GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read marketing visits" ON public.page_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX page_visits_visited_at_idx ON public.page_visits (visited_at);
ALTER TABLE public.profiles ADD COLUMN signup_utm_source text, ADD COLUMN signup_utm_medium text, ADD COLUMN signup_utm_campaign text, ADD COLUMN signup_landing_page text, ADD COLUMN signup_referrer text;
CREATE OR REPLACE FUNCTION public.capture_profile_signup_attribution() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a jsonb;
BEGIN
 SELECT raw_user_meta_data->'marketing_attribution' INTO a FROM auth.users WHERE id = NEW.user_id;
 IF jsonb_typeof(a) = 'object' AND a->>'landing_page' LIKE '/%' AND a->>'landing_page' NOT LIKE '//%' THEN
  NEW.signup_utm_source := left(coalesce(nullif(a->>'utm_source',''),'direct'),200);
  NEW.signup_utm_medium := left(coalesce(nullif(a->>'utm_medium',''),'none'),200);
  NEW.signup_utm_campaign := left(nullif(a->>'utm_campaign',''),200);
  NEW.signup_landing_page := left(split_part(split_part(a->>'landing_page','?',1),'#',1),2048);
  NEW.signup_referrer := left(coalesce(a->>'referrer',''),2048);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER profiles_signup_attribution BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.capture_profile_signup_attribution();
CREATE OR REPLACE FUNCTION public.record_signup_attribution(a jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF jsonb_typeof(a) <> 'object' OR a->>'landing_page' IS NULL OR a->>'landing_page' NOT LIKE '/%' OR a->>'landing_page' LIKE '//%' THEN RAISE EXCEPTION 'Invalid attribution'; END IF;
 UPDATE public.profiles p SET signup_utm_source=left(coalesce(nullif(a->>'utm_source',''),'direct'),200), signup_utm_medium=left(coalesce(nullif(a->>'utm_medium',''),'none'),200), signup_utm_campaign=left(nullif(a->>'utm_campaign',''),200), signup_landing_page=left(split_part(split_part(a->>'landing_page','?',1),'#',1),2048), signup_referrer=left(coalesce(a->>'referrer',''),2048)
 WHERE p.user_id=auth.uid() AND p.signup_utm_source IS NULL AND p.created_at >= now()-interval '24 hours' AND p.created_at >= (a->>'captured_at')::timestamptz - interval '5 minutes';
 GET DIAGNOSTICS n = ROW_COUNT;
 RETURN n > 0;
END; $$;
REVOKE ALL ON FUNCTION public.record_signup_attribution(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_signup_attribution(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.marketing_attribution_summary(p_grain text DEFAULT 'day', p_days integer DEFAULT 30) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF p_grain NOT IN ('day','week') OR p_days < 1 OR p_days > 366 THEN RAISE EXCEPTION 'Invalid range'; END IF;
 SELECT jsonb_build_object('grain',p_grain,'timezone','UTC','signups',coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM (SELECT date_trunc(p_grain,created_at AT TIME ZONE 'UTC') AS period, signup_utm_source AS utm_source, signup_utm_medium AS utm_medium, count(*) AS signups FROM public.profiles WHERE created_at >= now()-make_interval(days=>p_days) AND signup_utm_source IS NOT NULL GROUP BY 1,2,3 ORDER BY 1 DESC,2,3) s),'[]'::jsonb),'visits',coalesce((SELECT jsonb_agg(to_jsonb(v)) FROM (SELECT date_trunc(p_grain,visited_at AT TIME ZONE 'UTC') AS period, utm_source, count(*) AS visits FROM public.page_visits WHERE visited_at >= now()-make_interval(days=>p_days) GROUP BY 1,2 ORDER BY 1 DESC,2) v),'[]'::jsonb)) INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.marketing_attribution_summary(text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.marketing_attribution_summary(text,integer) TO authenticated;
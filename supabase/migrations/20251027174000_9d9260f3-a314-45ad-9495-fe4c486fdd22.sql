-- 1) Update rate limit function to support funnel_events (idempotent)
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit(p_table text, p_session_id text, p_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  IF p_table = 'page_views' THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.page_views
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    RETURN recent_count = 0;
  ELSIF p_table = 'button_clicks' THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.button_clicks
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    RETURN recent_count < 3;
  ELSIF p_table = 'funnel_events' THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.funnel_events
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    RETURN recent_count < 5; -- allow up to 4 events per window
  END IF;
  RETURN FALSE;
END;
$$;

-- 2) Fix funnel_events insert policy to use proper table name in rate limit check
DROP POLICY IF EXISTS "Rate limited funnel event inserts" ON public.funnel_events;
CREATE POLICY "Rate limited funnel event inserts"
ON public.funnel_events
FOR INSERT
WITH CHECK (check_analytics_rate_limit('funnel_events'::text, session_id, 10));

-- 3) Allow safe updates to recent page_views rows so we can write time_on_page/scroll_depth/is_bounce
DROP POLICY IF EXISTS "Allow updates to recent page views" ON public.page_views;
CREATE POLICY "Allow updates to recent page views"
ON public.page_views
FOR UPDATE
USING (created_at > now() - interval '1 day');
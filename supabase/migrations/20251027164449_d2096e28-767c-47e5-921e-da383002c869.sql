
-- Исправляем функцию rate limiting с фиксированным search_path
CREATE OR REPLACE FUNCTION check_analytics_rate_limit(
  p_table TEXT,
  p_session_id TEXT,
  p_seconds INTEGER
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Для page_views: максимум 1 запись за указанное время
  IF p_table = 'page_views' THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.page_views
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    
    RETURN recent_count = 0;
  
  -- Для button_clicks: максимум 3 записи за указанное время
  ELSIF p_table = 'button_clicks' THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.button_clicks
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    
    RETURN recent_count < 3;
  END IF;
  
  RETURN FALSE;
END;
$$;

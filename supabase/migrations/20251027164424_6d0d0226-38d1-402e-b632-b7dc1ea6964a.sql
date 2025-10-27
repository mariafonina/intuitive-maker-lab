
-- Добавляем session_id для отслеживания уникальных сессий
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE button_clicks ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Создаем индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_button_clicks_session_id ON button_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_button_clicks_created_at ON button_clicks(created_at DESC);

-- Добавляем функцию для server-side rate limiting в RLS
-- Проверяем, не было ли недавних записей от этой сессии
CREATE OR REPLACE FUNCTION check_analytics_rate_limit(
  p_table TEXT,
  p_session_id TEXT,
  p_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Для page_views: максимум 1 запись за указанное время
  IF p_table = 'page_views' THEN
    SELECT COUNT(*) INTO recent_count
    FROM page_views
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    
    RETURN recent_count = 0;
  
  -- Для button_clicks: максимум 3 записи за указанное время
  ELSIF p_table = 'button_clicks' THEN
    SELECT COUNT(*) INTO recent_count
    FROM button_clicks
    WHERE session_id = p_session_id
      AND created_at > NOW() - (p_seconds || ' seconds')::INTERVAL;
    
    RETURN recent_count < 3;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем RLS политику для page_views с server-side rate limiting
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
CREATE POLICY "Rate limited page view inserts"
ON page_views
FOR INSERT
WITH CHECK (
  -- Разрешаем только если прошло достаточно времени с последней записи
  check_analytics_rate_limit('page_views', session_id, 10)
);

-- Обновляем RLS политику для button_clicks с server-side rate limiting  
DROP POLICY IF EXISTS "Anyone can insert button clicks" ON button_clicks;
CREATE POLICY "Rate limited button click inserts"
ON button_clicks
FOR INSERT
WITH CHECK (
  -- Разрешаем максимум 3 клика за 10 секунд от одной сессии
  check_analytics_rate_limit('button_clicks', session_id, 10)
);

-- Комментарии для документации
COMMENT ON COLUMN page_views.session_id IS 'Unique session identifier for tracking unique visitors. Generated client-side and stored in sessionStorage.';
COMMENT ON COLUMN button_clicks.session_id IS 'Unique session identifier for tracking unique visitors. Generated client-side and stored in sessionStorage.';
COMMENT ON FUNCTION check_analytics_rate_limit IS 'Server-side rate limiting for analytics events. Prevents spam by limiting inserts based on session_id and time window.';

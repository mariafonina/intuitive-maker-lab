-- Добавляем поля для глубины вовлечения
ALTER TABLE public.page_views
ADD COLUMN scroll_depth integer DEFAULT 0,
ADD COLUMN time_on_page integer DEFAULT 0;

-- Добавляем комментарии для ясности
COMMENT ON COLUMN public.page_views.scroll_depth IS 'Maximum scroll depth percentage (0-100)';
COMMENT ON COLUMN public.page_views.time_on_page IS 'Time spent on page in seconds';
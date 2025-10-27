-- Создание таблицы для отслеживания просмотров страниц
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для отслеживания кликов по кнопкам
CREATE TABLE IF NOT EXISTS public.button_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  button_type TEXT, -- 'purchase', 'contact', 'link', etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_button_clicks_created_at ON public.button_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_button_clicks_button_type ON public.button_clicks(button_type);

-- Включаем Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.button_clicks ENABLE ROW LEVEL SECURITY;

-- Политика: любой может вставлять данные (для аналитики)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can insert button clicks"
  ON public.button_clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Политика: только админы могут читать данные
CREATE POLICY "Admins can view page views"
  ON public.page_views
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can view button clicks"
  ON public.button_clicks
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
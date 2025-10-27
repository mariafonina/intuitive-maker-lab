-- Добавляем поля для воронки и returning visitors
ALTER TABLE public.page_views
ADD COLUMN is_bounce boolean DEFAULT false,
ADD COLUMN is_returning boolean DEFAULT false,
ADD COLUMN pages_in_session integer DEFAULT 1;

-- Создаем таблицу для отслеживания воронки
CREATE TABLE public.funnel_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  page_path text NOT NULL,
  event_name text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Включаем RLS для funnel_events
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Политики для funnel_events
CREATE POLICY "Rate limited funnel event inserts"
ON public.funnel_events
FOR INSERT
WITH CHECK (check_analytics_rate_limit('button_clicks'::text, session_id, 10));

CREATE POLICY "Admins can view funnel events"
ON public.funnel_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);

-- Комментарии
COMMENT ON COLUMN public.page_views.is_bounce IS 'True if user left after viewing only one page';
COMMENT ON COLUMN public.page_views.is_returning IS 'True if user has visited before (based on localStorage)';
COMMENT ON COLUMN public.page_views.pages_in_session IS 'Number of pages viewed in current session';
COMMENT ON TABLE public.funnel_events IS 'Tracks user journey through conversion funnel';
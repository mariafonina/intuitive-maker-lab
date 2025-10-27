-- Add UTM tracking columns to page_views table
ALTER TABLE public.page_views
ADD COLUMN utm_source text,
ADD COLUMN utm_medium text,
ADD COLUMN utm_campaign text,
ADD COLUMN utm_term text,
ADD COLUMN utm_content text;

-- Add index for better query performance on UTM fields
CREATE INDEX idx_page_views_utm_source ON public.page_views(utm_source);
CREATE INDEX idx_page_views_utm_campaign ON public.page_views(utm_campaign);
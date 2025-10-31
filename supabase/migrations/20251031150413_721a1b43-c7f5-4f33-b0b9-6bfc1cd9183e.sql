-- Update articles_public view to include new columns
DROP VIEW IF EXISTS public.articles_public;

CREATE VIEW public.articles_public AS
SELECT 
  id,
  title,
  subtitle,
  description,
  og_image,
  slug,
  content,
  published,
  show_in_feed,
  noindex,
  created_at,
  updated_at
FROM public.articles
WHERE published = true;
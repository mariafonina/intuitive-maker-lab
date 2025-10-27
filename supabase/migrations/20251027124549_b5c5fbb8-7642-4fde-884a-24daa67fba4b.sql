-- Recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS public.articles_public;

CREATE VIEW public.articles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  subtitle,
  content,
  description,
  og_image,
  slug,
  published,
  created_at,
  updated_at
FROM public.articles
WHERE published = true;
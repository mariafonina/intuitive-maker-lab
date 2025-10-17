-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.articles_public;

CREATE VIEW public.articles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  subtitle,
  content,
  published,
  created_at,
  updated_at
FROM public.articles
WHERE published = true;

-- Grant SELECT permission on the view to anonymous and authenticated users
GRANT SELECT ON public.articles_public TO anon, authenticated;
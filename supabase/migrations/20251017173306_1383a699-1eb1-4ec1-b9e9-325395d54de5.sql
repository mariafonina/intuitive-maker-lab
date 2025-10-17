-- Create a view for public access to articles without author_id
CREATE OR REPLACE VIEW public.articles_public AS
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

-- The existing RLS policies on articles table remain for admin access
-- Public users should query articles_public view instead of articles table directly
-- Add SEO and social media fields to articles table
ALTER TABLE public.articles
ADD COLUMN description text,
ADD COLUMN og_image text,
ADD COLUMN slug text;

-- Create unique index on slug (only for non-null slugs)
CREATE UNIQUE INDEX articles_slug_unique ON public.articles(slug) WHERE slug IS NOT NULL;

-- Add slug column to articles_public view by recreating it
DROP VIEW IF EXISTS public.articles_public;

CREATE VIEW public.articles_public AS
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
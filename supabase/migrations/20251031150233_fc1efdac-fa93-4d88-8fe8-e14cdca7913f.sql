-- Add columns for controlling article visibility and indexation
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS show_in_feed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS noindex boolean DEFAULT false;

COMMENT ON COLUMN public.articles.show_in_feed IS 'Whether the article should appear in the articles feed';
COMMENT ON COLUMN public.articles.noindex IS 'Whether search engines should index this article';
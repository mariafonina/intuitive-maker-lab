-- Fix the RLS policy for page_views table to allow anonymous users to insert page views
DROP POLICY IF EXISTS "Rate limited page view inserts" ON public.page_views;

-- Create a new policy that allows anyone to insert page views with rate limiting
CREATE POLICY "Anyone can insert page views with rate limiting" 
ON public.page_views 
FOR INSERT 
WITH CHECK (check_analytics_rate_limit('page_views'::text, session_id, 10));
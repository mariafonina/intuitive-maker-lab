-- Drop existing permissive RLS policies for site_images
DROP POLICY IF EXISTS "Anyone can insert site images" ON public.site_images;
DROP POLICY IF EXISTS "Anyone can update site images" ON public.site_images;
DROP POLICY IF EXISTS "Anyone can delete site images" ON public.site_images;

-- Create admin-only policies for INSERT, UPDATE, DELETE
CREATE POLICY "Admins can insert site images" 
ON public.site_images 
FOR INSERT 
TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site images" 
ON public.site_images 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site images" 
ON public.site_images 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep "Anyone can view site images" policy as is (already exists)
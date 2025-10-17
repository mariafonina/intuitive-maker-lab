-- Drop existing policy that allows anyone to upload images
DROP POLICY IF EXISTS "Anyone can upload images" ON public.images;

-- Create new policy allowing only admins to upload images
CREATE POLICY "Admins can upload images"
ON public.images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Update storage bucket policies to restrict uploads to admins only
DROP POLICY IF EXISTS "Anyone can upload to images bucket" ON storage.objects;

CREATE POLICY "Admins can upload to images bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images from storage
CREATE POLICY "Admins can delete from images bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
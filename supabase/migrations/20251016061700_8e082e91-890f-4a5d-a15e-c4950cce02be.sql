-- Create a table for storing globally selected images
CREATE TABLE public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  image_size TEXT NOT NULL DEFAULT 'medium',
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view site images" 
ON public.site_images 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert site images" 
ON public.site_images 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update site images" 
ON public.site_images 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete site images" 
ON public.site_images 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_images_updated_at
BEFORE UPDATE ON public.site_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
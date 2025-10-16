-- Create table for editable text blocks
CREATE TABLE public.site_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view site texts"
  ON public.site_texts
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site texts"
  ON public.site_texts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site texts"
  ON public.site_texts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site texts"
  ON public.site_texts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_texts_updated_at
  BEFORE UPDATE ON public.site_texts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
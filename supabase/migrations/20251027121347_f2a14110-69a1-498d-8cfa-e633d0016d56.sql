-- Add sales_end_date and offer_url to offers table
ALTER TABLE public.offers 
ADD COLUMN sales_end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN offer_url TEXT NOT NULL DEFAULT '';
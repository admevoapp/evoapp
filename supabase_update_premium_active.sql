-- Add 'active' column to premium_content table
ALTER TABLE public.premium_content 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update existing records to be active by default
UPDATE public.premium_content SET active = true WHERE active IS NULL;

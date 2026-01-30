-- Add new columns to premium_content table
ALTER TABLE public.premium_content 
ADD COLUMN IF NOT EXISTS instructor_avatar TEXT,
ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT false;

-- Comment on columns
COMMENT ON COLUMN public.premium_content.instructor_avatar IS 'URL of the instructor/author profile picture';
COMMENT ON COLUMN public.premium_content.has_certificate IS 'Indicates if the content provides a certificate upon completion';

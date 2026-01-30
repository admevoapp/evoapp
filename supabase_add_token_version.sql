-- Add token_version to profiles for force logout functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;

-- Update existing rows to have 0
UPDATE public.profiles SET token_version = 0 WHERE token_version IS NULL;

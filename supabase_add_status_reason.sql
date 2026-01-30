-- Add status_reason to profiles for tracking admin actions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status_reason TEXT;

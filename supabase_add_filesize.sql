-- Add file_size column to central_items
ALTER TABLE public.central_items ADD COLUMN IF NOT EXISTS file_size text;

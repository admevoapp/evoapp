-- Drop the existing check constraint
ALTER TABLE public.central_items DROP CONSTRAINT IF EXISTS central_items_type_check;

-- Add the new check constraint including 'zip'
ALTER TABLE public.central_items ADD CONSTRAINT central_items_type_check 
CHECK (type IN ('video', 'audio', 'pdf', 'text', 'zip'));

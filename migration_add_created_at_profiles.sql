-- Add created_at column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Optional: backfill existing rows with updated_at if appropriate, otherwise they get now() via default
-- update public.profiles set created_at = updated_at where created_at > updated_at;

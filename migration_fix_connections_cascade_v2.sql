-- Migration to fix constraint violations on user deletion
-- Issue: Deleting a user fails because of foreign keys in the 'connections' table.
-- Fix: Re-create foreign keys with ON DELETE CASCADE.

BEGIN;

-- 1. Drop existing constraints for 'user_id'
ALTER TABLE public.connections
DROP CONSTRAINT IF EXISTS connections_user_id_fkey;

-- 2. Add 'user_id' constraint with CASCADE
ALTER TABLE public.connections
ADD CONSTRAINT connections_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Drop existing constraints for 'friend_id' (just to be safe and consistent)
ALTER TABLE public.connections
DROP CONSTRAINT IF EXISTS connections_friend_id_fkey;

-- 4. Add 'friend_id' constraint with CASCADE
ALTER TABLE public.connections
ADD CONSTRAINT connections_friend_id_fkey
FOREIGN KEY (friend_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

COMMIT;

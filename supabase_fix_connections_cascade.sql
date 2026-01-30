-- FIX: Allow cascading delete for user connections (friendships)
-- PROBLEM: Deleting a user fails because their ID is still referenced in the 'connections' table as 'friend_id'.
-- SOLUTION: Drop the strict constraint and re-add it with ON DELETE CASCADE.

BEGIN;

-- 1. Drop the existing strict constraint if it exists
ALTER TABLE public.connections
DROP CONSTRAINT IF EXISTS connections_friend_id_fkey;

-- 2. Re-add the constraint pointing to profiles with CASCADE
-- This ensures when a user profile is deleted, all their incoming friendships are also removed.
ALTER TABLE public.connections
ADD CONSTRAINT connections_friend_id_fkey
FOREIGN KEY (friend_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

COMMIT;

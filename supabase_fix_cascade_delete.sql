-- FIX: Allow cascading delete from auth.users to public.profiles
-- FAILURE REASON: The error "violates foreign key constraint 'profiles_id_fkey'" happened because
-- the database prevents deleting a User if they still have a Profile.
-- We must change the constraint to "ON DELETE CASCADE" so the Profile is automatically deleted when the User is deleted.

BEGIN;

-- 1. Drop the strict constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Re-add the constraint with CASCADE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

COMMIT;

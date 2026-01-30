-- FUNCTION: delete_user_account
-- DESCRIPTION: Allows admins to permanently delete a user from auth.users (cascades to profiles).

CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check permission: executing user must be admin, master OR deleting themselves
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (app_role = 'admin' OR app_role = 'master')
  ) AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete other accounts.';
  END IF;

  -- Delete from auth.users. 
  -- Ensure that public.profiles has ON DELETE CASCADE reference to auth.users if not already.
  -- (Standard Supabase setup usually has this).
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

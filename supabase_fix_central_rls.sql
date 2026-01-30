-- Reset RLS policies for central_items to ensure consistency

-- Drop existing policies to avoid conflicts
drop policy if exists "Public central items are viewable by everyone" on public.central_items;
drop policy if exists "Admins can insert central items" on public.central_items;
drop policy if exists "Admins can update central items" on public.central_items;
drop policy if exists "Admins can delete central items" on public.central_items;
drop policy if exists "Admins full access" on public.central_items;

-- 1. Public Read Policy (Only Active items)
create policy "Public view active items"
  on public.central_items for select
  using ( active = true );

-- 2. Admin Full Access Policy (Select, Insert, Update, Delete)
-- Note: Requires checking the profiles table for 'admin' or 'master' role
create policy "Admins full access"
  on public.central_items for all
  using ( 
    auth.role() = 'authenticated' AND (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and (profiles.app_role = 'admin' or profiles.app_role = 'master')
      )
    )
  );

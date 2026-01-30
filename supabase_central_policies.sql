-- Add UPDATE and DELETE policies for central_items
create policy "Admins can update central items"
  on public.central_items for update
  using ( 
    auth.role() = 'authenticated' AND (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and (profiles.app_role = 'admin' or profiles.app_role = 'master')
      )
    )
  );

create policy "Admins can delete central items"
  on public.central_items for delete
  using ( 
    auth.role() = 'authenticated' AND (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and (profiles.app_role = 'admin' or profiles.app_role = 'master')
      )
    )
  );

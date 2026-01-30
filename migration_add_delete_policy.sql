-- Policy to allow admins to delete reports
create policy "Admins can delete reports"
  on public.reports for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.app_role in ('admin', 'master')
    )
  );

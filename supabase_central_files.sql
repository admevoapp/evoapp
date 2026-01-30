-- Create a new storage bucket for central files
insert into storage.buckets (id, name, public)
values ('central_files', 'central_files', true)
on conflict (id) do nothing;

-- Policy to allow public access to files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'central_files' );

-- Policy to allow authenticated admins to upload files
create policy "Admin Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'central_files' AND
    auth.role() = 'authenticated' AND (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and (profiles.app_role = 'admin' or profiles.app_role = 'master')
      )
    )
  );

-- Policy to allow admins to delete files
create policy "Admin Delete"
  on storage.objects for delete
  using (
    bucket_id = 'central_files' AND
    auth.role() = 'authenticated' AND (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and (profiles.app_role = 'admin' or profiles.app_role = 'master')
      )
    )
  );

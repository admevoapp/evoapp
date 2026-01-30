-- Check RLS policies for profiles
select * from pg_policies where tablename = 'profiles';

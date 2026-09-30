-- Register the site owner as the admin.
-- 1. In Supabase: Authentication -> Users -> "Add user" -> enter the owner's email
--    (sign-ups are disabled, so the user must be created here first).
-- 2. Replace the email below and run this in the SQL editor.
insert into public.admins (user_id)
select id from auth.users where email = 'owner@example.com'
on conflict do nothing;

-- Run this ONCE in Supabase: SQL Editor, New query, paste, Run.
-- It only replaces the is_admin() check. Your data is not touched.
-- Nothing changes until you turn Two-step verification ON in the admin Account window.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- 1) must be the admin email
  -- 2) if two-step verification is turned ON for this user (a verified authenticator app exists),
  --    the login must also have passed the 6-digit code step (aal2)
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('sachinkrcodes@gmail.com')  -- <YOUR_ADMIN_EMAIL>
     and (
       coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
       or not exists (
         select 1 from auth.mfa_factors f
         where f.user_id = auth.uid() and f.status = 'verified'
       )
     );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- =====================================================================
--  little-world-birthday  |  Supabase schema
--  How to run: Supabase dashboard -> SQL Editor -> New query -> paste ALL of
--  this -> Run. It is safe to run again.
--
--  ADMIN EMAIL: change it in ONE place, the is_admin() function below.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('sachinkrcodes@gmail.com');  -- <YOUR_ADMIN_EMAIL>
$$;

-- ---------------------------------------------------------------- pages table
create table if not exists public.pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  status           text not null default 'draft' check (status in ('draft', 'published')),
  recipient_name   text not null default '' check (char_length(recipient_name) <= 80),
  birthday_date    date,
  unlock_at        timestamptz,
  expires_at       timestamptz,
  pin_hash         text,
  has_pin          boolean generated always as (pin_hash is not null) stored,
  pin_fail_count   int not null default 0,
  pin_locked_until timestamptz,
  language         text not null default 'en' check (language ~ '^[a-z]{2,3}(-[A-Za-z]{2,4})?$'),
  content          jsonb not null default '{}'::jsonb check (octet_length(content::text) <= 200000),
  music            jsonb not null default '{"type":"builtin","url":"","title":""}'::jsonb
                   check (octet_length(music::text) <= 5000),
  view_count       int not null default 0,
  first_opened_at  timestamptz,
  last_opened_at   timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.pages enable row level security;

-- Nobody gets direct access by default. Visitors (anon) get NOTHING on this table.
revoke all on table public.pages from anon, authenticated;

-- The admin (a logged-in user) gets only these columns. pin_hash is never readable.
grant select (id, slug, status, recipient_name, birthday_date, unlock_at, expires_at, has_pin,
              language, content, music, view_count, first_opened_at, last_opened_at, created_at)
  on public.pages to authenticated;
grant insert (slug, status, recipient_name, birthday_date, unlock_at, expires_at, language, content, music)
  on public.pages to authenticated;
grant update (slug, status, recipient_name, birthday_date, unlock_at, expires_at, language, content, music)
  on public.pages to authenticated;
grant delete on public.pages to authenticated;

drop policy if exists "admin select" on public.pages;
drop policy if exists "admin insert" on public.pages;
drop policy if exists "admin update" on public.pages;
drop policy if exists "admin delete" on public.pages;
create policy "admin select" on public.pages for select to authenticated using (public.is_admin());
create policy "admin insert" on public.pages for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.pages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.pages for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- get_page (public)
-- Returns ONE page, only if it is published and not expired.
-- state: 'ok' | 'locked' | 'pin_required' | 'pin_wrong' | 'gone'
create or replace function public.get_page(p_slug text, p_pin text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  r      public.pages%rowtype;
  now_ts timestamptz := now();
  st_ms  bigint := (extract(epoch from now()) * 1000)::bigint;
  pin    text := left(coalesce(p_pin, ''), 32);
begin
  select * into r from public.pages
   where slug = lower(btrim(p_slug)) and status = 'published';

  if not found or (r.expires_at is not null and r.expires_at <= now_ts) then
    return jsonb_build_object('state', 'gone', 'server_time', st_ms);
  end if;

  if r.unlock_at is not null and r.unlock_at > now_ts then
    return jsonb_build_object(
      'state', 'locked', 'locked', true,
      'unlock_at', r.unlock_at, 'server_time', st_ms);
  end if;

  if r.pin_hash is not null then
    if pin = '' then
      return jsonb_build_object('state', 'pin_required', 'server_time', st_ms);
    end if;
    if r.pin_locked_until is not null and r.pin_locked_until > now_ts then
      return jsonb_build_object(
        'state', 'pin_wrong', 'server_time', st_ms,
        'retry_after', ceil(extract(epoch from (r.pin_locked_until - now_ts)))::int);
    end if;
    if r.pin_hash <> extensions.crypt(pin, r.pin_hash) then
      -- 5 wrong tries in a row = 5 minute pause (stops guessing)
      update public.pages set
        pin_fail_count   = case when pin_fail_count + 1 >= 5 then 0 else pin_fail_count + 1 end,
        pin_locked_until = case when pin_fail_count + 1 >= 5 then now_ts + interval '5 minutes' else pin_locked_until end
       where id = r.id;
      return jsonb_build_object('state', 'pin_wrong', 'server_time', st_ms);
    end if;
    if r.pin_fail_count > 0 then
      update public.pages set pin_fail_count = 0, pin_locked_until = null where id = r.id;
    end if;
  end if;

  return jsonb_build_object(
    'state', 'ok',
    'server_time', st_ms,
    'recipient_name', r.recipient_name,
    'birthday_date', r.birthday_date,
    'language', r.language,
    'content', r.content,
    'music', r.music);
end;
$$;

-- ---------------------------------------------------------------- record_view (public)
create or replace function public.record_view(p_slug text)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.pages set
    view_count      = view_count + 1,
    first_opened_at = coalesce(first_opened_at, now()),
    last_opened_at  = now()
  where slug = lower(btrim(p_slug))
    and status = 'published'
    and (expires_at is null or expires_at > now())
    and (unlock_at is null or unlock_at <= now());
$$;

-- ---------------------------------------------------------------- set_page_pin (admin only)
-- p_pin = 4 to 8 digits to set a PIN, or null / '' to remove it.
create or replace function public.set_page_pin(p_page_id uuid, p_pin text)
returns void
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_pin is null or p_pin = '' then
    update public.pages set pin_hash = null, pin_fail_count = 0, pin_locked_until = null where id = p_page_id;
  else
    if p_pin !~ '^[0-9]{4,8}$' then
      raise exception 'PIN must be 4 to 8 digits' using errcode = '22023';
    end if;
    update public.pages
       set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
           pin_fail_count = 0, pin_locked_until = null
     where id = p_page_id;
  end if;
end;
$$;

revoke all on function public.get_page(text, text) from public;
revoke all on function public.record_view(text) from public;
revoke all on function public.set_page_pin(uuid, text) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.get_page(text, text) to anon, authenticated;
grant execute on function public.record_view(text) to anon, authenticated;
grant execute on function public.set_page_pin(uuid, text) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------- storage
-- Public bucket: anyone with the exact file link can see the file, but nobody can LIST files
-- (there is no select policy for visitors). Only the admin can write, list and delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('birthday-media', 'birthday-media', true, 8388608,
        array['image/webp', 'image/jpeg', 'audio/mpeg', 'audio/mp3'])
on conflict (id) do update
  set public = true,
      file_size_limit = 8388608,
      allowed_mime_types = array['image/webp', 'image/jpeg', 'audio/mpeg', 'audio/mp3'];

drop policy if exists "birthday-media admin select" on storage.objects;
drop policy if exists "birthday-media admin insert" on storage.objects;
drop policy if exists "birthday-media admin update" on storage.objects;
drop policy if exists "birthday-media admin delete" on storage.objects;
create policy "birthday-media admin select" on storage.objects for select to authenticated
  using (bucket_id = 'birthday-media' and public.is_admin());
create policy "birthday-media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'birthday-media' and public.is_admin());
create policy "birthday-media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'birthday-media' and public.is_admin())
  with check (bucket_id = 'birthday-media' and public.is_admin());
create policy "birthday-media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'birthday-media' and public.is_admin());

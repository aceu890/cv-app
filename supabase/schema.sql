-- Folio: esquema inicial
-- Pegar y ejecutar en Supabase: SQL Editor → New query → Run
--
-- Después, en Authentication → Providers → Google:
-- 1. Activa Google
-- 2. Pega Client ID y Client Secret de Google Cloud
-- 3. Authentication → URL Configuration:
--    Site URL: http://localhost:3000
--    Redirect URLs: http://localhost:3000/auth/callback

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Mi CV',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cvs_user_id_updated_at_idx
  on public.cvs (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists cvs_set_updated_at on public.cvs;
create trigger cvs_set_updated_at
  before update on public.cvs
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  insert into public.cvs (user_id, title, data)
  select
    new.id,
    'Mi CV',
    jsonb_build_object(
      'personal', jsonb_build_object(
        'fullName', coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          ''
        ),
        'title', '',
        'email', coalesce(new.email, ''),
        'phone', '',
        'location', '',
        'website', '',
        'summary', ''
      ),
      'experience', '[]'::jsonb,
      'education', '[]'::jsonb,
      'skills', '[]'::jsonb,
      'template', 'folio'
    )
  where not exists (
    select 1 from public.cvs where user_id = new.id
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "cvs_select_own" on public.cvs;
create policy "cvs_select_own"
  on public.cvs for select
  using (auth.uid() = user_id);

drop policy if exists "cvs_insert_own" on public.cvs;
create policy "cvs_insert_own"
  on public.cvs for insert
  with check (auth.uid() = user_id);

drop policy if exists "cvs_update_own" on public.cvs;
create policy "cvs_update_own"
  on public.cvs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cvs_delete_own" on public.cvs;
create policy "cvs_delete_own"
  on public.cvs for delete
  using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.cvs to authenticated;

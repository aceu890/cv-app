-- Link público + QR. Pegar en Supabase → SQL Editor → Run
-- (También está al final de schema.sql)

create table if not exists public.public_shares (
  slug text primary key,
  title text not null default 'Currículum',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.public_shares enable row level security;

drop policy if exists "shares_select_all" on public.public_shares;
create policy "shares_select_all"
  on public.public_shares for select
  using (true);

drop policy if exists "shares_insert_all" on public.public_shares;
create policy "shares_insert_all"
  on public.public_shares for insert
  with check (true);

drop policy if exists "shares_update_all" on public.public_shares;
create policy "shares_update_all"
  on public.public_shares for update
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.public_shares to anon, authenticated;

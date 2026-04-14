-- Migration v2: Decouple players from auth (allows guest/friend players without accounts)
-- + adds sets JSONB column for individual set scores
-- Safe to run on a fresh project — drops and recreates all tables.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.match_players;
drop table if exists public.matches;
drop table if exists public.players;

-- Players: can exist without an auth account (guests added by name)
create table public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  created_by uuid not null references public.players(id)
);

-- sets: [{my: 6, opp: 4}, ...] stored from each player's perspective
create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id),
  partner_id uuid references public.players(id),
  score_for int not null check (score_for >= 0),
  score_against int not null check (score_against >= 0),
  sets jsonb not null default '[]',
  won boolean not null
);

alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;

create policy "Players are viewable by all" on public.players
  for select using (true);

create policy "Authenticated users can insert players" on public.players
  for insert with check (auth.uid() is not null);

create policy "Players can update their own profile" on public.players
  for update using (auth.uid() = user_id);

create policy "Matches are viewable by all" on public.matches
  for select using (true);

create policy "Authenticated users can insert matches" on public.matches
  for insert with check (
    exists (select 1 from public.players p where p.id = created_by and p.user_id = auth.uid())
  );

create policy "Match players are viewable by all" on public.match_players
  for select using (true);

create policy "Authenticated users can insert match_players" on public.match_players
  for insert with check (
    exists (
      select 1 from public.matches m
      join public.players p on p.id = m.created_by
      where m.id = match_id and p.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.players (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

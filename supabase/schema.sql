-- Run this in your Supabase SQL editor to set up the database.

-- Players (extends Supabase auth.users)
create table public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  created_by uuid not null references public.players(id)
);

-- Match participants (supports doubles: player + optional partner per side)
create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id),
  partner_id uuid references public.players(id),
  score_for int not null check (score_for >= 0),
  score_against int not null check (score_against >= 0),
  won boolean not null
);

-- Row Level Security
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;

-- Players: readable by all authenticated users, writable only by owner
create policy "Players are viewable by all" on public.players
  for select using (true);

create policy "Players can insert their own profile" on public.players
  for insert with check (auth.uid() = id);

create policy "Players can update their own profile" on public.players
  for update using (auth.uid() = id);

-- Matches: readable by all, insertable by authenticated users
create policy "Matches are viewable by all" on public.matches
  for select using (true);

create policy "Authenticated users can insert matches" on public.matches
  for insert with check (auth.uid() = created_by);

-- Match players: readable by all, insertable by authenticated users
create policy "Match players are viewable by all" on public.match_players
  for select using (true);

create policy "Authenticated users can insert match_players" on public.match_players
  for insert with check (
    exists (
      select 1 from public.matches m
      where m.id = match_id and m.created_by = auth.uid()
    )
  );

-- Auto-create player profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.players (id, display_name, avatar_url)
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

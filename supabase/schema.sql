-- ====================================================================
-- PHYSICS MOTION MECHANICS SANDBOX - SUPABASE SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor to set up tables and RLS
-- ====================================================================

-- 1. Create Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  institution text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Experiments table
create table if not exists public.experiments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  motion_type text not null check (motion_type in ('ideal', 'air_resistance')),
  parameters jsonb not null,
  results jsonb not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Indexes for query performance
create index if not exists idx_experiments_user_id on public.experiments(user_id);
create index if not exists idx_experiments_created_at on public.experiments(created_at desc);
create index if not exists idx_experiments_motion_type on public.experiments(motion_type);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.experiments enable row level security;

-- 5. Profiles RLS Policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 6. Experiments RLS Policies
create policy "Users can select own experiments" 
  on public.experiments for select 
  using (auth.uid() = user_id);

create policy "Users can insert own experiments" 
  on public.experiments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own experiments" 
  on public.experiments for update 
  using (auth.uid() = user_id);

create policy "Users can delete own experiments" 
  on public.experiments for delete 
  using (auth.uid() = user_id);

-- 7. Trigger to automatically handle updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists on_experiments_updated on public.experiments;
create trigger on_experiments_updated
  before update on public.experiments
  for each row execute function public.handle_updated_at();

-- 8. Trigger to create user profile upon auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

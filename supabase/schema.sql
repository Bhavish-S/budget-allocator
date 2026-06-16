-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Portfolios
create table public.portfolios (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  budget numeric(15,2) not null check (budget > 0),
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Investment categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  color text not null,
  icon text not null
);

-- Pre-populate categories
insert into public.categories (name, color, icon) values
  ('Stocks', '#2D5EA8', 'trending-up'),
  ('Bonds', '#16A34A', 'shield'),
  ('Mutual Funds', '#C9A84C', 'pie-chart'),
  ('Fixed Deposit', '#8A9BB5', 'lock'),
  ('Real Estate', '#D97706', 'home'),
  ('Cryptocurrency', '#DC2626', 'zap'),
  ('ETF', '#1B3A6B', 'layers'),
  ('Gold', '#C9A84C', 'gem');

-- Investments
create table public.investments (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  cost numeric(15,2) not null check (cost > 0),
  expected_return numeric(15,2) not null check (expected_return >= 0),
  category_id uuid references public.categories(id),
  risk_level integer check (risk_level between 1 and 5) default 3,
  created_at timestamptz default now()
);

-- Optimization runs
create table public.optimization_runs (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  total_budget numeric(15,2) not null,
  total_cost numeric(15,2) not null,
  total_return numeric(15,2) not null,
  roi_percent numeric(8,4) not null,
  selected_investment_ids uuid[] not null,
  dp_table_snapshot jsonb,
  greedy_result_json jsonb,
  algorithm_variant text default '0/1-dp',
  execution_time_ms integer,
  run_at timestamptz default now()
);

-- Shared portfolios
create table public.shared_portfolios (
  id uuid default uuid_generate_v4() primary key,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.investments enable row level security;
alter table public.optimization_runs enable row level security;
alter table public.shared_portfolios enable row level security;
alter table public.categories enable row level security;

-- RLS Policies
create policy "Users own their profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users own their portfolios" on public.portfolios
  for all using (auth.uid() = user_id);

create policy "Users own their investments" on public.investments
  for all using (auth.uid() = user_id);

create policy "Users own their runs" on public.optimization_runs
  for all using (auth.uid() = user_id);

create policy "Users manage their shares" on public.shared_portfolios
  for all using (auth.uid() = user_id);

create policy "Public can view shared portfolios" on public.portfolios
  for select using (
    exists (
      select 1 from public.shared_portfolios sp
      where sp.portfolio_id = id
      and (sp.expires_at is null or sp.expires_at > now())
    )
  );

create policy "Categories are public" on public.categories
  for select using (true);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_portfolios_user_id on public.portfolios(user_id);
create index idx_investments_portfolio_id on public.investments(portfolio_id);
create index idx_investments_user_id on public.investments(user_id);
create index idx_optimization_runs_portfolio_id on public.optimization_runs(portfolio_id);
create index idx_optimization_runs_user_id on public.optimization_runs(user_id);
create index idx_optimization_runs_run_at on public.optimization_runs(run_at desc);
create index idx_shared_portfolios_token on public.shared_portfolios(share_token);

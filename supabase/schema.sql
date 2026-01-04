-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  username text unique,
  xp_total int default 0,
  streak_count int default 0,
  last_active_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- QUESTIONS TABLE
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  category text not null,
  difficulty int not null check (difficulty between 1 and 5),
  question_text text not null,
  answers jsonb not null, -- Array of strings
  correct_index int not null,
  explanation text,
  source_url text,
  tags jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- QUIZ SESSIONS TABLE
create table public.quiz_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  score int default 0,
  correct_count int default 0,
  duration_ms int default 0,
  answers_log jsonb default '[]'::jsonb, 
  started_at timestamp with time zone default timezone('utc'::text, now()),
  ended_at timestamp with time zone
);

-- RLS POLICIES
alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_sessions enable row level security;

-- Users can read their own data
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Everyone can read active questions
create policy "Everyone can read active questions" on public.questions
  for select using (is_active = true);

-- Only admins can insert/update/delete questions (We'll use a simple email check or service role for admin app for now, 
-- but strictly speaking this should be locked down. For MVP, we can make it readable by all, 
-- writeable by none (and us Service Role in API) OR add an admin policy later.
-- Let's stick to Service Role for Admin writes for simplicity in MVP or add a specific Policy if we have user claims.)

-- Users can insert their own sessions
create policy "Users can insert own sessions" on public.quiz_sessions
  for insert with check (auth.uid() = user_id);

-- Users can read their own sessions
create policy "Users can read own sessions" on public.quiz_sessions
  for select using (auth.uid() = user_id);

-- FUNCTION TO HANDLE NEW USER SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER FOR NEW USER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

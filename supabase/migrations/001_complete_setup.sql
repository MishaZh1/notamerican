-- =====================================================
-- NOTAMERICAN DATABASE SETUP - COMPLETE MIGRATION
-- =====================================================
-- This migration sets up all tables, policies, and triggers
-- for the NotAmerican authentication and game system
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Stores user profile data linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  
  -- OAuth Profile Data
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Social Stats
  xp_total INT DEFAULT 0,
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  last_active_date DATE, -- YYYY-MM-DD
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_xp_total ON public.users(xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- QUESTIONS TABLE
-- =====================================================
-- Stores quiz questions for various game modes
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  question_text TEXT NOT NULL,
  answers JSONB NOT NULL, -- Array of strings
  correct_index INT NOT NULL,
  explanation TEXT,
  source_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);

-- =====================================================
-- QUIZ SESSIONS TABLE
-- =====================================================
-- Stores completed quiz sessions for both authenticated and guest users
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  duration_ms INT DEFAULT 0,
  
  -- Guest user data (when user_id is NULL)
  guest_name TEXT,
  guest_email TEXT,
  
  -- Game metadata
  game_mode TEXT, -- 'flags', 'capitals', 'matching', etc.
  answers_log JSONB DEFAULT '[]'::jsonb, 
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_score ON public.quiz_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.quiz_sessions(started_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Public can read leaderboard" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Everyone can read active questions" ON public.questions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Public can read leaderboard sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Guests can insert sessions" ON public.quiz_sessions;

-- USERS POLICIES
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Public can read leaderboard data (limited fields for privacy)
CREATE POLICY "Public can read leaderboard" ON public.users
  FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- QUESTIONS POLICIES
-- Everyone can read active questions
CREATE POLICY "Everyone can read active questions" ON public.questions
  FOR SELECT USING (is_active = true);

-- QUIZ SESSIONS POLICIES
-- Authenticated users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON public.quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Guests can insert sessions (user_id is NULL)
CREATE POLICY "Guests can insert sessions" ON public.quiz_sessions
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON public.quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Public can read sessions for leaderboard (both authenticated and guest)
CREATE POLICY "Public can read leaderboard sessions" ON public.quiz_sessions
  FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user signup
-- Automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      SPLIT_PART(new.email, '@', 1)
    ),
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =====================================================
-- HELPER VIEWS (Optional but useful)
-- =====================================================

-- Leaderboard view (top 100 users by XP)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  xp_total,
  streak_current,
  streak_best,
  ROW_NUMBER() OVER (ORDER BY xp_total DESC) as rank
FROM public.users
WHERE xp_total > 0
ORDER BY xp_total DESC
LIMIT 100;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to anonymous users (for guest play)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.questions TO anon;
GRANT INSERT ON public.quiz_sessions TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.leaderboard TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this migration in your Supabase SQL Editor
-- or via the Supabase CLI
-- =====================================================

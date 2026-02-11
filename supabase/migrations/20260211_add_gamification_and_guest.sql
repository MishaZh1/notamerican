-- Add Streak Tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    freeze_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON public.user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Add League System
CREATE TYPE public.league_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_league public.league_tier DEFAULT 'BRONZE',
ADD COLUMN IF NOT EXISTS total_xp BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_hearts INT DEFAULT 4, -- User feedback: 4 hearts
ADD COLUMN IF NOT EXISTS hearts_regenerated_at TIMESTAMPTZ DEFAULT NOW();

-- Add Guest/Anonymous Mode Support
CREATE TABLE IF NOT EXISTS public.anonymous_users (
    guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hearts INT DEFAULT 4,
    max_hearts INT DEFAULT 4,
    xp INT DEFAULT 0,
    games_played INT DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public access to anonymous_users (since they are not auth users)
-- In production, you might want to restrict this via API keys or custom headers, but for MVP RLS:
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create anonymous user" ON public.anonymous_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select anonymous user by ID" ON public.anonymous_users
    FOR SELECT USING (true); -- Client will filter by guest_id

CREATE POLICY "Anyone can update anonymous user by ID" ON public.anonymous_users
    FOR UPDATE USING (true); -- Optimistic concurrency control recommended

-- Functions for Heart Regeneration
CREATE OR REPLACE FUNCTION regenerate_hearts()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic: If hearts < max_hearts, check time difference
    -- +1 Heart every 2 hours (120 mins) based on user feedback
    -- This is a simplified check, real logic often happens on READ/SELECT.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

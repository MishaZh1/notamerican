-- Migration: Add Hearts & Monetization System
-- Date: 2026-01-16
-- Agent: C (User Lifecycle & Monetization)

-- ============================================================================
-- UPDATE USERS TABLE
-- ============================================================================

-- Add games tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS games_played_total INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS games_played_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_limit_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Add heart packs (purchased hearts)
ALTER TABLE users ADD COLUMN IF NOT EXISTS heart_packs_owned INTEGER DEFAULT 0;

-- Add subscription tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_games_played_total ON users(games_played_total);

-- ============================================================================
-- CREATE TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription_monthly', 'subscription_yearly', 'heart_pack_5', 'heart_pack_20')),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_id TEXT UNIQUE,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_id ON transactions(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert transactions (via API)
CREATE POLICY "Authenticated users can insert transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get hearts for current game based on games played
CREATE OR REPLACE FUNCTION get_hearts_for_game(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  games_played INTEGER;
  is_premium BOOLEAN;
  heart_packs INTEGER;
BEGIN
  SELECT 
    games_played_total,
    subscription_tier != 'free' AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW()),
    heart_packs_owned
  INTO games_played, is_premium, heart_packs
  FROM users
  WHERE id = user_id_param;
  
  -- Premium users always get 5 hearts
  IF is_premium THEN
    RETURN 5;
  END IF;
  
  -- Users with heart packs get 5 hearts
  IF heart_packs > 0 THEN
    RETURN 5;
  END IF;
  
  -- First 3 games: 5 hearts
  IF games_played < 3 THEN
    RETURN 5;
  END IF;
  
  -- After 3 games: 1 heart
  RETURN 1;
END;
$$;

-- Function to increment games played
CREATE OR REPLACE FUNCTION increment_games_played(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_reset_date DATE;
  today DATE;
BEGIN
  SELECT daily_limit_reset_at::DATE, CURRENT_DATE
  INTO current_reset_date, today;
  
  -- Reset daily counter if it's a new day
  IF current_reset_date < today THEN
    UPDATE users
    SET 
      games_played_today = 1,
      games_played_total = games_played_total + 1,
      daily_limit_reset_at = NOW()
    WHERE id = user_id_param;
  ELSE
    UPDATE users
    SET 
      games_played_today = games_played_today + 1,
      games_played_total = games_played_total + 1
    WHERE id = user_id_param;
  END IF;
END;
$$;

-- Function to use a heart pack
CREATE OR REPLACE FUNCTION use_heart_pack(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  packs_available INTEGER;
BEGIN
  SELECT heart_packs_owned INTO packs_available
  FROM users
  WHERE id = user_id_param;
  
  IF packs_available > 0 THEN
    UPDATE users
    SET heart_packs_owned = heart_packs_owned - 1
    WHERE id = user_id_param;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE transactions IS 'Stores all monetary transactions (subscriptions and heart pack purchases)';
COMMENT ON COLUMN users.games_played_total IS 'Total games played by user (determines heart allocation)';
COMMENT ON COLUMN users.heart_packs_owned IS 'Number of purchased heart packs (each gives 5 hearts for one game)';
COMMENT ON COLUMN users.subscription_tier IS 'Subscription level: free, premium_monthly, premium_yearly';
COMMENT ON FUNCTION get_hearts_for_game IS 'Returns number of hearts user should get for current game';
COMMENT ON FUNCTION increment_games_played IS 'Increments both daily and total game counters';
COMMENT ON FUNCTION use_heart_pack IS 'Consumes one heart pack, returns true if successful';

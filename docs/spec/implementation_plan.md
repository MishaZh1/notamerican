# Implementation Plan: Growth, Retention & Addictive Gameplay

# Goal
Transform the current MVP into a high-retention, high-conversion product by refining user flows, adding persistent gamification, and expanding authentication options.

## User Review Required
> [!IMPORTANT]
> **Authentication**: Adding Facebook/Apple auth requires setting up accounts on Meta/Apple developer portals and adding keys to Supabase dashboard.
> **Emails**: Requires a transactional email provider (Resend, SendGrid) API key.
> **Database Changes**: Migrations will add tables for `leagues`, `quests`, and `streaks`.

## Proposed Changes

### 1. Retention & Gamification Engine 🎮
We will implement a "Habit Loop" system.

#### Database Schema
- **New Table**: `user_streaks`
  - `user_id` (FK)
  - `current_streak` (int)
  - `last_played_at` (timestamp)
  - `freeze_count` (int) - allows missing a day
- **New Table**: `leagues`
  - `id` (enum: BRONZE, SILVER, GOLD, DIAMOND)
  - `min_xp` (int)
- **New Table**: `user_progress` (Enhanced)
  - Add `total_xp`, `current_league`, `completed_continents` (jsonb array of stamps)

#### Logic (Server Actions)
- `checkStreak(userId)`: logic to reset streak if > 48h since last play, or consume freeze.
- `awardXP(userId, amount)`: handle level ups and league promotions.

### 2. User Flow & Conversion 💸
Refine the journey to minimize friction.

#### [MODIFY] `src/app/page.tsx` (Landing)
- Add "Guest Mode" persistence: Generate a `guest_id` in localStorage/cookies immediately.
- Sync `guest_id` to Supabase `anonymous_users` table (new) to track hearts/progress before signup.

#### [MODIFY] `src/components/monetization/PremiumModal.tsx`
- Implement "Smart Trigger" logic: Pass `triggerSource` prop (e.g., "out_of_hearts", "locked_region").
- Customize the specific offer based on trigger (e.g., "Need hearts?" vs "Unlock Asia").
- Add "One-Time Offer" persistence using DB timestamp, not just local state.

### 3. Authentication Expansion 🔐
#### [MODIFY] `src/app/login/page.tsx`
- Add tabs: "Sign In" vs "Sign Up".
- Add **Email/Password** form using `supabase.auth.signUp()`.
- Add **Social Buttons**: Apple & Facebook (requires Supabase config).
- **Guest Conversion**: On sign-up, look for `guest_id` cookie and merge stats (hearts, XP) to the new account.

### 4. Branding & Theming 🎨
#### [MODIFY] `tailwind.config.ts` & `src/app/globals.css`
- Abstract colors into CSS variables (`--primary`, `--secondary`, `--accent`).
- Create `themes/` folder with presets (e.g., "Classic", "Dark", "Playful").
- **Mascot**: Create `src/components/ui/Mascot.tsx`.
  - Props: `mood` (happy, sad, excited), `size`.
  - Maps to optimized SVGs/Images.

### 5. Marketing Readiness 📈
#### [NEW] `src/app/sitemap.ts` & `src/app/robots.ts`
- Auto-generate SEO files.
#### [NEW] `src/components/seo/MetaPixel.tsx`
- fast integration for Facebook/Instagram ads tracking.

## Technical Tasks Breakdown

### Phase 1: Persistence (The Foundation)
1. Create `anonymous_users` table mechanism.
2. Update `src/app/actions-hearts.ts` to check `guest_id` if no auth user.
3. Migrate `timeLeft` for offers to DB (`offer_expires_at` column in `users`).

### Phase 2: Gamification (The Hook)
1. Create `user_streaks` table.
2. Implement visual "Streak Flame" in Dashboard.
3. Implement `XP` system and `Leagues` visual component.

### Phase 3: Auth & Polish
1. Implement Email/Pass auth.
2. Refactor Color Palette to CSS variables.
3. Replace hardcoded images with `Mascot` component.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `checkStreak` logic (does it reset after 48h?).
- **Integration**: Test `guest` -> `user` conversion (does XP transfer?).

### Manual Verification
1. **Guest Flow**: Play as guest -> Earn hearts -> Sign up -> Verify hearts remain.
2. **Streak Test**: Manually manipulate DB `last_played_at` to yesterday, play game, verify streak +1.
3. **Payment Trigger**: Lose all hearts -> Verify Modal appears -> Verify "One-Time Offer" timer matches DB.

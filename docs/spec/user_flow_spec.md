# User Flow & Conversion Specification

## 1. The "Hook" Flow (First Session)
This flow is designed to maximize Day 1 retention and conversion.

1.  **Landing Page**: 
    - User arrives. **Action**: Generate `guest_id` cookie immediately.
    - **KPI**: Time to First Game < 5 seconds.
2.  **The First Game (Free)**:
    - User plays "Match Madness" or "Flag Challenge".
    - **Outcome**: User gets a "High Score" (e.g., 500 XP).
    - **Visual**: "New Record! You are in the top 20% of players today."
3.  **The Registration Wall (Soft Hook)**:
    - *Trigger*: After 1st game completion.
    - *Prompt*: "Save your progress and see where you rank in the Global League."
    - *Option A*: "Sign Up to Save" (Main CTA) -> Email/Social Auth.
    - *Option B*: "Continue as Guest" (Secondary, grey text) -> Persists `guest_id`.
4.  **The Heart Depletion (Hard Hook)**:
    - User plays 3-5 more games.
    - **Logic**: Heart deducts -1 per game.
    - *Trigger*: Hearts reaches 0.
    - *Modal*: "Out of Hearts!"
    - *Option A*: "Wait 4 hours" (Passive).
    - *Option B*: "Get Unlimited Hearts (Trial/Sub)" (Conversion).
    - *Option C*: "Watch Ad" (Future placeholder, not now).

## 2. Heart Economy Logic ❤️
- **Max Hearts**: 5 (Default).
- **Regeneration Rate**: +1 Heart every 4 hours.
- **Cost**: -1 Heart per Game Start (not per loss, to keep it simple).
- **Unlimited State**: If `subscription_status = active`, hearts are infinite (UI shows Infinity symbol).
- **notifications**: Push/Email when hearts are full (Retention loop).

## 3. Smart Paywalls (Conversion Triggers) 💰
We will handle paywalls differently based on *context*.

| Trigger Context | User Motivation | Offer Highlight |
| :--- | :--- | :--- |
| **Out of Hearts** | "I want to keep playing NOW." | **Starter Pack ($2.99)** or **Monthly Sub**. Focus on "Instant Refill". |
| **Locked Region** | "I want to explore Asia/Europe." | **Yearly Sub**. Focus on "Unlock Everything" & "Best Value". |
| **Streak at Risk** | "I don't want to lose my 5-day streak." | **Streak Freeze ($0.99)** (Micro-transaction) or included in Premium. |
| **New High Score** | "I'm doing great, I want status." | **Leaderboard Badge** (Premium Only). |

## 4. Returning User Logic (Persistence) 🔄
- **Scenario**: User plays as Guest on Phone A, closes tab, comes back 2 hours later.
- **Requirement**: `guest_id` from Cookie matches database `anonymous_users`.
    - Retrieve: Heart count (calculated based on time passed), XP, Streak.
    - **Result**: User sees "Welcome back! Your hearts recharged to 3."
- **Scenario**: User clears cache / Private Tab.
    - **Result**: New User. (Unavoidable without login).

## 5. Sign-Up & Account Linking 🔗
- **Trigger**: User decides to subscribe or save progress.
- **Action**: User clicks "Sign Up with Apple".
- **Backend Logic**: 
    1. Create new `auth.users` row.
    2. Check for `guest_id` cookie.
    3. If exists, COPY `xp`, `games_played`, `hearts` from `anonymous_users` to new `public.users` profile.
    4. Delete `guest_id` cookie (or link it).
    5. **Result**: Seamless transition. No progress lost.

## 6. The Retention Loop (The Infinite Game) ♾️
This is the "End State" - a cyclical habit loop that keeps users for years.

1.  **Morning Trigger**: Push Notification "Your hearts are full!" or "New Daily Challenge available".
2.  **Action**: User plays 3-5 games (~5 mins) during commute.
3.  **Reward**: Earns XP -> Moves up in Weekly League -> Maintains Streak 🔥.
4.  **Investment**: User customizes avatar with new unlocks -> "I have built something here".
5.  **Evening Trigger**: Email "You dropped to Silver League! Play now to save your rank."
6.  **Result**: The user is not just "playing a game", they are *managing their geography career*.

**Definition of Done for MVP**:
- User can Register -> Play -> Pay -> track progress over multiple days without data loss.
- System correctly sends "Come back" email/push after 24h inactivity.

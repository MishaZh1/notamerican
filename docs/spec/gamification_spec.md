# Gamification & Engagement Logic

## 1. League System 🏆
We will introduce **Weekly Leagues** to drive competition and retention.

- **Structure**: Every user is placed in a random cohort of ~50 players every week (Mon-Sun).
- **Ranking Metric**: Total XP gained *that week*.
- **Tiers**:
    1.  🥉 **Bronze**: Bottom 50% (Starting tier).
    2.  🥈 **Silver**: Top 50% (Promoted from Bronze).
    3.  🥇 **Gold**: Top 20% (Promoted from Silver).
    4.  💎 **Diamond**: Top 5% (The Elite).

- **Promotion/Relegation**:
    - **Top 10** advance to next tier.
    - **Bottom 5** demote (if > Bronze).
    - **Rest** stay.
    - **Reset**: Every Sunday at midnight UTC.

## 2. XP Curve & Scoring 📈
XP is the core currency for leagues and levels.

- **Match Madness**:
    - **Base**: +10 XP per match found.
    - **Bonus**: +50 XP for perfect game (no mistakes).
    - **Speed Bonus**: +2 XP per second remaining.
- **Flag Challenge**:
    - **Base**: +20 XP per flag.
    - **Streak Multiplier**: +5 XP for >3 correct in a row.

- **Level Cap**: infinite (e.g., Level 1 requires 100 XP, Level 50 needs 5000 XP).
- **UI**: Progress bar fills after every game. "Level Up!" modal with confetti.

## 3. Daily Streaks 🔥
The most powerful retention mechanic.

- **Definition**: Playing *at least one game* in a 24-hour window (UTC based).
- **Visuals**:
    - **Day 1**: 🔥 Grey flame turns Orange.
    - **Day 3**: 🔥 "3 Day Streak!" notification.
    - **Day 7**: 🔥 **Double XP Day** unlocked for 24h.
    - **Day 30**: 🏆 "Month Master" Badge.

- **Streak Freeze ❄️**:
    - **Concept**: Protects streak if user misses a day.
    - **Acquisition**: Can be bought with Gems (future currency) or $0.99.
    - **Premium Perk**: 1 Free Freeze per month.

## 4. Collection / Passport 🛂
Visual progression beyond score.

- **Concept**: A digital "Passport" that gets stamped when a user "Masters" a continent.
- **Mastery Criteria**:
    - **Bronze Stamp**: Complete all levels in region.
    - **Silver Stamp**: 3-Star all levels.
    - **Gold Stamp**: Top 10% speed on all levels.
- **Reward**: Unlocks special "Traveler" avatar frames.

## 5. Season Reset & Prestige (The Long Game) 🌟
To prevent "maxed out" players from quitting, we introduce Seasons.

- **Season Duration**: 3 Months.
- **End of Season**:
    - **Leagues Reset**: Everyone drops to Silver/Bronze.
    - **Hall of Fame**: Top 100 Diamond players get a permanent profile badge "Season 1 Champion".
    - **Prestige**: If User reached Max Level (e.g., 100), they can "Prestige".
        - Reset Level to 1.
        - Gain a permanent XP Multiplier (1.1x).
        - Unlock a new Name Color (Gold -> Diamond -> Ruby).

**Definition of Done for MVP**:
- User earns correct XP per game.
- Weekly League logic correctly promotes/demotes users on Sunday.
- Streak logic correctly handles missed days vs. frozen days.

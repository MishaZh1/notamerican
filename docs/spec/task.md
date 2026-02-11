# Product Roadmap: Growth, Retention & Monetization

## 1. User Flow & Conversion Optimization 🚀
- [ ] **Define "The Hook" Flow**: Map out the exact sequence from Landing -> First Game -> Hook -> Registration/Payment.
- [ ] **Heart System Logic**: Define precise rules for heart consumption, regeneration, and "Out of Hearts" triggers.
- [ ] **Smart Paywalls**: Identify the optimal moments to show the paywall (e.g., after a "near miss" or streak loss) to maximize conversion.
- [ ] **Checkout Friction Reduction**: Ensure "One-Click" feel for upgrades (e.g., Guest Checkout persistence).

## 2. Retention & Persistence 🧠
- [ ] **Server-Side State**: Move critical timers (heart regeneration, offer countdowns) to the database to prevent client-side resets.
- [ ] **User Identification**: Implement "Fingerprinting" or persistent cookies to recognize returning guests before they sign up.
- [ ] **Lifecycle Emails**: Plan email triggers for "Hearts Full", "Streak at Risk", and "Special Offer" (requires SendGrid/Resend).

## 3. Authentication Expansion 🔐
- [ ] **Email/Password Auth**: Implement standard email sign-up/login.
- [ ] **Social Providers**: Add Facebook and Apple authentication via Supabase.
- [ ] **Account Linking**: Allow guest accounts to merge with newly created authenticated accounts without losing progress.

## 4. Branding & UI Flexibility 🎨
- [ ] **Theme Engine**: Refactor Tailwind config to use CSS variables for all primary/secondary colors, allowing instant palette swaps.
- [ ] **Mascot Component**: Create a centralized `Mascot` component to easily swap character assets globally.
- [ ] **Marketing Assets**: Prepare OG Images, Meta Tags, and "Share" card generators.

## 5. Advanced Gamification (The "Addictive" Layer) 🎮
- [ ] **Leagues System**: Weekly cohorts (Bronze -> Diamond) based on XP to drive competitive engagement.
- [ ] **Daily Streaks**: Design a "Streak Freeze" and "Double XP" economy to build daily habits.
- [ ] **Collection/Passport**: "Stamps" for unlocking regions/continents (visual progression beyond just a score).

## 6. Technical Foundations 🛠️
- [ ] **Backend/Frontend Separation**: Audit code to ensure sensitive logic (scoring, payments) stays on the server (Server Actions).
- [ ] **Edge Caching**: Optimize static assets and regional content delivery.

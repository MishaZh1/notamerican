# 🔐 NotAmerican Authentication System

## Overview

This authentication system uses **Supabase SSR (Server-Side Rendering)** with Next.js 14 App Router to provide secure, seamless authentication for the NotAmerican geography learning app.

## Features

✅ **Email/Password Authentication** - Traditional signup and login  
✅ **Google OAuth** - One-click social login  
✅ **Protected Routes** - Middleware-based route protection  
✅ **User Profiles** - Automatic profile creation on signup  
✅ **Guest Mode** - Play without authentication  
✅ **Session Management** - Secure cookie-based sessions  
✅ **Dashboard** - User stats, XP, streaks, and game history  

---

## 📁 File Structure

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx          # Login UI with email/password + Google OAuth
│   │   └── actions.ts         # Server actions for auth operations
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # OAuth callback handler
│   ├── dashboard/
│   │   ├── page.tsx           # Protected dashboard (server component)
│   │   └── DashboardClient.tsx # Dashboard UI (client component)
│   └── page.tsx               # Home page with login/dashboard link
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser client
│       ├── server.ts          # Server client
│       └── middleware.ts      # Session refresh helper
└── middleware.ts              # Route protection middleware

supabase/
└── migrations/
    └── 001_complete_setup.sql # Database schema and RLS policies
```

---

## 🚀 Setup Instructions

### 1. Configure Supabase

#### A. Environment Variables

Ensure your `.env.local` file has the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production
```

#### B. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_complete_setup.sql`
4. Click **Run** to execute the migration

This will create:
- `users` table with profile data
- `questions` table for quiz content
- `quiz_sessions` table for game history
- Row Level Security (RLS) policies
- Automatic user profile creation trigger
- Leaderboard view

#### C. Configure OAuth Providers

##### Google OAuth Setup:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow the instructions to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret** to Supabase
5. Save the configuration

### 2. Configure Site URL

In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

---

## 🔒 How It Works

### Authentication Flow

#### Email/Password Signup:
1. User fills out email/password form
2. `signUpWithEmail()` server action is called
3. Supabase creates auth user
4. Database trigger automatically creates profile in `users` table
5. User is redirected to dashboard

#### Email/Password Login:
1. User enters credentials
2. `signInWithEmail()` server action validates
3. Session cookie is set
4. User is redirected to dashboard

#### Google OAuth:
1. User clicks "Google" button
2. `signInWithGoogle()` redirects to Google
3. User authorizes the app
4. Google redirects to `/auth/callback`
5. Callback route exchanges code for session
6. User profile is auto-created (if new user)
7. User is redirected to dashboard

### Route Protection

The middleware (`src/middleware.ts`) runs on every request:

```typescript
// Protected routes
const protectedRoutes = ['/dashboard']

// Redirect to login if not authenticated
if (isProtectedRoute && !user) {
  return redirect('/login')
}

// Redirect to dashboard if already logged in
if (pathname === '/login' && user) {
  return redirect('/dashboard')
}
```

### Session Management

- Sessions are stored in **HTTP-only cookies** (secure)
- Middleware automatically refreshes sessions
- Sessions expire after inactivity (configurable in Supabase)

---

## 🎨 UI Components

### Login Page (`/login`)
- Email/password form with validation
- Google OAuth button
- Toggle between Sign Up / Sign In
- Guest mode link
- Premium glassmorphism design

### Dashboard (`/dashboard`)
- User profile with avatar
- Stats cards: XP, Current Streak, Best Streak, Games Played
- Recent game history
- Quick action buttons (Play, Leaderboard)
- Sign out button

---

## 🧪 Testing the System

### Test Email/Password Auth:
1. Navigate to `http://localhost:3000/login`
2. Toggle to "Sign Up"
3. Enter email and password (min 6 characters)
4. Click "Sign Up"
5. Check your email for confirmation (if email confirmation is enabled)
6. You should be redirected to `/dashboard`

### Test Google OAuth:
1. Navigate to `http://localhost:3000/login`
2. Click "Google" button
3. Select your Google account
4. Authorize the app
5. You should be redirected to `/dashboard`

### Test Route Protection:
1. Sign out from dashboard
2. Try to access `http://localhost:3000/dashboard` directly
3. You should be redirected to `/login`

### Test Guest Mode:
1. From login page, click "Continue as guest"
2. You should be able to play games without authentication
3. Scores will be saved with guest name/email (optional)

---

## 📊 Database Schema

### `users` Table
```sql
id              UUID PRIMARY KEY (references auth.users)
username        TEXT UNIQUE
email           TEXT
display_name    TEXT
avatar_url      TEXT
xp_total        INT (default: 0)
streak_current  INT (default: 0)
streak_best     INT (default: 0)
last_active_date DATE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `quiz_sessions` Table
```sql
id              UUID PRIMARY KEY
user_id         UUID (references users, nullable for guests)
score           INT
correct_count   INT
total_questions INT
duration_ms     INT
guest_name      TEXT (for guest users)
guest_email     TEXT (for guest users)
game_mode       TEXT ('flags', 'capitals', etc.)
answers_log     JSONB
started_at      TIMESTAMP
ended_at        TIMESTAMP
```

---

## 🔐 Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data  
✅ **HTTP-only Cookies** - Session tokens not accessible via JavaScript  
✅ **Server-Side Validation** - All auth operations happen on the server  
✅ **CSRF Protection** - Built into Supabase SSR  
✅ **Password Hashing** - Handled by Supabase Auth (bcrypt)  
✅ **OAuth Security** - State parameter prevents CSRF attacks  

---

## 🚨 Troubleshooting

### Issue: "Invalid login credentials"
- **Solution**: Verify email/password are correct. Check if email confirmation is required in Supabase settings.

### Issue: Google OAuth not working
- **Solution**: 
  1. Verify OAuth credentials in Supabase
  2. Check redirect URIs match exactly
  3. Ensure Google+ API is enabled

### Issue: Dashboard shows "Loading..." forever
- **Solution**: 
  1. Check browser console for errors
  2. Verify database migration ran successfully
  3. Check if `users` table exists and has data

### Issue: Session expires too quickly
- **Solution**: Adjust session timeout in Supabase Dashboard → Authentication → Settings

### Issue: Middleware redirects in a loop
- **Solution**: Check middleware logic and ensure protected routes array is correct

---

## 🎯 Next Steps

- [ ] Add email verification flow
- [ ] Implement password reset
- [ ] Add profile editing
- [ ] Implement social features (friends, challenges)
- [ ] Add admin panel for managing users
- [ ] Implement rate limiting
- [ ] Add two-factor authentication (2FA)

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

## 🤝 Support

For issues or questions, please refer to:
- Supabase Discord: https://discord.supabase.com
- Next.js Discussions: https://github.com/vercel/next.js/discussions

---

**Built with ❤️ using Supabase + Next.js 14**

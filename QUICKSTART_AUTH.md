# 🚀 Quick Start Guide - Authentication System

## For Developers: Get Auth Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Supabase account created
- Project cloned and dependencies installed (`npm install`)

---

## Step 1: Configure Environment (1 min)

Create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy `URL`, `anon public`, and `service_role` keys

---

## Step 2: Set Up Database (2 min)

### Option A: Manual (Recommended)
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase/migrations/001_complete_setup.sql`
4. Paste and click **Run**
5. ✅ You should see "Success. No rows returned"

### Option B: Using CLI
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

---

## Step 3: Test Basic Auth (1 min)

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000/login
```

**Test Email/Password:**
1. Click "Sign Up"
2. Enter any email and password (min 6 chars)
3. Click "Sign Up"
4. Check your email for confirmation (if enabled)
5. You should be redirected to `/dashboard`

**Test Guest Mode:**
1. Click "Continue as guest"
2. You should be able to play games

---

## Step 4: Configure Google OAuth (Optional, 2 min)

### A. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

### B. Configure in Supabase
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google**
3. Paste **Client ID** and **Client Secret**
4. Click **Save**

### C. Test Google OAuth
1. Go to `http://localhost:3000/login`
2. Click **Google** button
3. Select your Google account
4. Authorize the app
5. You should be redirected to `/dashboard`

---

## Step 5: Configure Site URLs (1 min)

In Supabase Dashboard → **Authentication** → **URL Configuration**:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

For production, add:
```
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/**
```

---

## ✅ Verification Checklist

Test these to ensure everything works:

- [ ] `/login` page loads with email/password form
- [ ] Can sign up with email/password
- [ ] Can sign in with existing account
- [ ] Google OAuth button appears (if configured)
- [ ] Can sign in with Google (if configured)
- [ ] Redirects to `/dashboard` after login
- [ ] Dashboard shows user profile and stats
- [ ] Can sign out from dashboard
- [ ] Accessing `/dashboard` without auth redirects to `/login`
- [ ] Can play as guest from login page

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- **Cause**: Wrong email/password or email not confirmed
- **Fix**: Check credentials or disable email confirmation in Supabase → Authentication → Settings

### Google OAuth not working
- **Cause**: Incorrect redirect URI or OAuth not configured
- **Fix**: Verify redirect URI matches exactly: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

### Dashboard shows blank/loading forever
- **Cause**: Database migration not run or RLS policies blocking access
- **Fix**: Re-run migration SQL in Supabase SQL Editor

### "Failed to fetch" errors
- **Cause**: CORS or environment variables not set
- **Fix**: Verify `.env.local` has correct Supabase URL and keys

### Session expires immediately
- **Cause**: Cookie settings or session timeout
- **Fix**: Check Supabase → Authentication → Settings → Session timeout

---

## 📂 Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/login/page.tsx` | Login UI |
| `src/app/login/actions.ts` | Auth server actions |
| `src/app/auth/callback/route.ts` | OAuth callback |
| `src/app/dashboard/page.tsx` | Protected dashboard |
| `src/middleware.ts` | Route protection |
| `supabase/migrations/001_complete_setup.sql` | Database schema |

---

## 🎯 What You Can Do Now

### As a User:
- ✅ Sign up with email/password
- ✅ Sign in with Google OAuth
- ✅ View dashboard with stats
- ✅ See game history
- ✅ Play as guest

### As a Developer:
- ✅ Add more OAuth providers (GitHub, Discord, etc.)
- ✅ Customize user profile fields
- ✅ Implement password reset
- ✅ Add email verification flow
- ✅ Create admin panel
- ✅ Add more protected routes

---

## 📚 Next Steps

1. **Read Full Documentation**: `AUTH_SETUP.md`
2. **Review Implementation**: `TRACK_B_COMPLETE.md`
3. **Customize UI**: Edit `src/app/login/page.tsx` and `src/app/dashboard/DashboardClient.tsx`
4. **Add Features**: See "Next Steps" section in `TRACK_B_COMPLETE.md`

---

## 🆘 Need Help?

- **Documentation**: See `AUTH_SETUP.md` for detailed setup
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Next.js Docs**: https://nextjs.org/docs
- **Discord**: https://discord.supabase.com

---

## 🎉 You're All Set!

Your authentication system is now fully functional. Users can:
- Sign up and sign in
- Use Google OAuth (if configured)
- Access protected dashboard
- View their stats and game history
- Play as guests

**Happy coding! 🚀**

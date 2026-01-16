# ✅ Track B Setup Checklist

Use this checklist to track your progress setting up the authentication system.

---

## 📋 Pre-Setup

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Project cloned
- [ ] Dependencies installed (`npm install`)

---

## 🔧 Environment Configuration

- [ ] Created `.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `NEXT_PUBLIC_SITE_URL`
- [ ] Verified all values are correct

**Where to find values:**
- Supabase Dashboard → Settings → API

---

## 🗄️ Database Setup

- [ ] Opened Supabase SQL Editor
- [ ] Copied `supabase/migrations/001_complete_setup.sql`
- [ ] Pasted and ran the SQL
- [ ] Verified "Success. No rows returned" message
- [ ] Checked that `users` table exists
- [ ] Checked that `quiz_sessions` table exists
- [ ] Verified RLS policies are enabled

**How to verify:**
- Go to Supabase Dashboard → Table Editor
- Should see `users` and `quiz_sessions` tables

---

## 🔐 Email/Password Auth

- [ ] Started dev server (`npm run dev`)
- [ ] Navigated to `http://localhost:3000/login`
- [ ] Login page loads correctly
- [ ] Email/password form is visible
- [ ] Tested sign up with test account
- [ ] Received confirmation email (if enabled)
- [ ] Successfully signed in
- [ ] Redirected to `/dashboard`
- [ ] Dashboard shows user profile
- [ ] Can sign out successfully

---

## 🌐 Google OAuth (Optional)

### Google Cloud Console Setup
- [ ] Created/selected Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Set application type to "Web application"
- [ ] Added authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- [ ] Copied Client ID
- [ ] Copied Client Secret

### Supabase Configuration
- [ ] Opened Supabase Dashboard → Authentication → Providers
- [ ] Enabled Google provider
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Saved configuration

### Testing
- [ ] Google OAuth button appears on login page
- [ ] Clicked Google button
- [ ] Redirected to Google authorization
- [ ] Selected Google account
- [ ] Authorized the app
- [ ] Redirected back to app
- [ ] Landed on `/dashboard`
- [ ] Profile created automatically

---

## 🌍 Site URL Configuration

- [ ] Opened Supabase Dashboard → Authentication → URL Configuration
- [ ] Set Site URL to `http://localhost:3000` (dev)
- [ ] Added redirect URL: `http://localhost:3000/auth/callback`
- [ ] Added redirect URL: `http://localhost:3000/**`
- [ ] Saved configuration

**For Production:**
- [ ] Updated Site URL to production domain
- [ ] Added production redirect URLs
- [ ] Updated `NEXT_PUBLIC_SITE_URL` in environment

---

## 🧪 Testing & Verification

### Route Protection
- [ ] Signed out from dashboard
- [ ] Tried accessing `/dashboard` directly
- [ ] Redirected to `/login` ✅
- [ ] Signed in
- [ ] Redirected to `/dashboard` ✅

### Guest Mode
- [ ] Clicked "Continue as guest" from login page
- [ ] Can access game features
- [ ] Can play without authentication

### Session Persistence
- [ ] Signed in
- [ ] Refreshed page
- [ ] Still signed in ✅
- [ ] Closed browser
- [ ] Reopened browser
- [ ] Still signed in ✅

### Dashboard Features
- [ ] User profile displays correctly
- [ ] Avatar shows (or initials if no avatar)
- [ ] XP total shows
- [ ] Streak stats show
- [ ] Games played count shows
- [ ] Recent games list shows (if any)
- [ ] Play button works
- [ ] Leaderboard button works
- [ ] Sign out button works

---

## 📱 Mobile Testing (Optional)

- [ ] Opened on mobile device
- [ ] Login page is responsive
- [ ] Can sign in on mobile
- [ ] Dashboard is responsive
- [ ] All features work on mobile

---

## 🚀 Production Deployment (When Ready)

### Environment
- [ ] Set production environment variables
- [ ] Updated `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Verified all Supabase keys are correct

### Supabase Configuration
- [ ] Updated Site URL to production domain
- [ ] Added production redirect URLs
- [ ] Updated OAuth redirect URIs in Google Cloud Console
- [ ] Tested OAuth in production

### Deployment
- [ ] Deployed to hosting platform (Vercel, etc.)
- [ ] Verified login works in production
- [ ] Verified Google OAuth works in production
- [ ] Verified dashboard works in production
- [ ] Verified route protection works in production

---

## 📚 Documentation Review

- [ ] Read `QUICKSTART_AUTH.md`
- [ ] Read `AUTH_SETUP.md`
- [ ] Read `TRACK_B_COMPLETE.md`
- [ ] Read `TRACK_B_SUMMARY.md`
- [ ] Understand authentication flow
- [ ] Understand database schema
- [ ] Know how to troubleshoot issues

---

## 🎯 Optional Enhancements

- [ ] Enable email verification in Supabase
- [ ] Add password reset functionality
- [ ] Add profile editing page
- [ ] Add more OAuth providers (GitHub, Discord, etc.)
- [ ] Implement two-factor authentication
- [ ] Add admin panel
- [ ] Customize email templates

---

## ✅ Final Verification

- [ ] All core features working
- [ ] No console errors
- [ ] Authentication flow is smooth
- [ ] Dashboard displays correctly
- [ ] Route protection working
- [ ] Guest mode working
- [ ] Documentation reviewed
- [ ] Ready for user testing

---

## 🐛 Troubleshooting

If you encounter issues, check:

1. **Environment variables** - Are they correct?
2. **Database migration** - Did it run successfully?
3. **Supabase configuration** - Are URLs and keys correct?
4. **OAuth setup** - Are redirect URIs exact matches?
5. **Browser console** - Any error messages?

See `AUTH_SETUP.md` for detailed troubleshooting.

---

## 🎉 Completion

When all items are checked:

✅ **Track B: Authentication & Backend is COMPLETE!**

You now have:
- Secure authentication system
- User profiles with stats
- Protected routes
- Guest mode support
- Production-ready setup

**Next:** Move to Track C (Stabilization & Cleanup) or start integrating with game features!

---

**Questions or issues?**
- Review documentation in `AUTH_SETUP.md`
- Check troubleshooting section
- Consult Supabase documentation

**Happy coding! 🚀**

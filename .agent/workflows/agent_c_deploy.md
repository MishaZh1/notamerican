---
description: Agent C - Deploy NotAmerican to Production
---

# Agent C: Quick Deployment Workflow

This workflow guides Agent C through deploying NotAmerican from localhost to production.

## Prerequisites Check

Before starting, verify:
- [ ] Local server is running and working (`http://localhost:3000`)
- [ ] All features have been tested locally
- [ ] `.env.local` exists and contains all required variables
- [ ] Git repository is initialized

## Step 1: Check Git Status

```bash
cd /Users/mishazh/Desktop/APP/notamerican
git status
```

**Expected:** List of modified/untracked files
**Action:** Review changes to ensure no sensitive data

## Step 2: Review Changes

```bash
git diff
```

**Action:** Verify:
- No API keys or secrets in code
- `.env.local` is NOT being committed
- All changes are intentional

## Step 3: Stage and Commit Changes

```bash
git add .
git commit -m "feat: prepare for production deployment"
```

**Note:** Use appropriate commit message prefix (feat/fix/refactor/etc.)

## Step 4: Push to GitHub

```bash
git push origin main
```

**Expected:** Successfully pushed to remote
**If error:** Resolve conflicts or pull latest changes first

## Step 5: Test Production Build Locally

```bash
npm run build
```

**Expected:** Build completes without errors
**If errors:** Fix TypeScript/build issues before deploying

## Step 6: Deploy to Vercel (First Time)

### Option A: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository: `notamerican`
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (from `.env.local`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `.env.local`)
   - `SUPABASE_SERVICE_ROLE_KEY` (from `.env.local`)
6. Click "Deploy"

## Step 7: Verify Deployment

Once deployed, test the production site:

**Checklist:**
- [ ] Home page loads
- [ ] Login/signup works
- [ ] Games are playable
- [ ] Scores are saved to database
- [ ] No console errors
- [ ] PWA install prompt appears (mobile)

## Step 8: Set Up Automatic Deployments

In Vercel Dashboard:
1. Go to Project Settings → Git
2. Enable "Automatic Deployments"
3. Set Production Branch: `main`

**Result:** Future pushes to `main` will auto-deploy

## Future Deployments

After initial setup, deploying is simple:

```bash
# Make changes locally
# Test thoroughly at localhost:3000

# Commit and push
git add .
git commit -m "feat: your changes"
git push origin main

# Vercel automatically deploys!
```

## Rollback (If Needed)

If deployment breaks production:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

## Monitoring

**Daily checks:**
- Visit production URL to ensure site is up
- Check Vercel logs for errors: `vercel logs --prod`

**Weekly checks:**
- Review Vercel Analytics
- Check Supabase database performance

## Success Criteria

✅ Production site is live and accessible
✅ All features work in production
✅ Automatic deployments configured
✅ Environment variables properly set
✅ No critical errors in logs

---

**Production URL:** https://notamerican.vercel.app (or your custom domain)
**Vercel Dashboard:** https://vercel.com/dashboard
**Supabase Dashboard:** https://app.supabase.com

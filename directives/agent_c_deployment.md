# Agent C: Deployment & Production Management

## Role & Responsibilities

Agent C is responsible for **transitioning the NotAmerican app from local development to production**. This includes:
- Managing Git operations and version control
- Running and maintaining the live server
- Deploying to production (Vercel)
- Managing environment variables across environments
- Monitoring production health and performance

## Core Principles

1. **Never break production** - Always test locally before deploying
2. **Version everything** - Every deployment should be traceable to a git commit
3. **Environment parity** - Local, staging, and production should be as similar as possible
4. **Automate repetitive tasks** - Use scripts and CI/CD where possible
5. **Monitor and respond** - Track production health and respond to issues quickly

---

## Phase 1: Git Management

### Goal
Ensure all code changes are properly versioned and pushed to the remote repository.

### Prerequisites
- Git initialized in `/Users/mishazh/Desktop/APP/notamerican`
- Remote repository configured (GitHub/GitLab/etc.)

### Steps

#### 1.1 Check Current Git Status
```bash
cd /Users/mishazh/Desktop/APP/notamerican
git status
```

**What to look for:**
- Untracked files
- Modified files
- Files staged for commit
- Current branch name

#### 1.2 Review Changes Before Committing
```bash
git diff
```

**Best practices:**
- Review all changes to ensure no sensitive data (API keys, passwords) are included
- Check that `.env.local` is in `.gitignore`
- Verify that `node_modules/` is not being tracked

#### 1.3 Stage and Commit Changes
```bash
# Stage specific files
git add <file1> <file2>

# Or stage all changes (use with caution)
git add .

# Commit with descriptive message
git commit -m "feat: [description of changes]"
```

**Commit message conventions:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - UI/styling changes
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

#### 1.4 Push to Remote
```bash
# Push to main branch
git push origin main

# Or push to feature branch
git push origin <branch-name>
```

### Common Issues & Solutions

**Issue:** "Your branch is behind 'origin/main'"
```bash
git pull origin main --rebase
git push origin main
```

**Issue:** Merge conflicts
```bash
# Resolve conflicts in your editor
git add <resolved-files>
git rebase --continue
```

**Issue:** Accidentally committed sensitive data
```bash
# Remove from last commit (before pushing)
git reset HEAD~1
# Edit .gitignore to exclude the file
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: update gitignore"
```

---

## Phase 2: Local Server Management

### Goal
Ensure the development server runs reliably and is ready for production deployment.

### Current State
- Server running: `npm run dev` in `/Users/mishazh/Desktop/APP/notamerican`
- Running for: 49h52m44s
- Accessible at: `http://localhost:3000`

### Steps

#### 2.1 Monitor Server Health
```bash
# Check if server is running
ps aux | grep "npm run dev"

# Check port usage
lsof -i :3000
```

#### 2.2 Restart Server (if needed)
```bash
# Stop current server
# Find the process ID from the terminal or:
pkill -f "npm run dev"

# Start fresh
npm run dev
```

#### 2.3 Build for Production (Test)
```bash
# Test production build locally
npm run build

# Check for build errors
# If successful, test the production build
npm run start
```

**What to verify:**
- No TypeScript errors
- No build warnings
- All pages load correctly
- All API routes work
- Database connections succeed

#### 2.4 Clean Up (if needed)
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall (if dependencies are broken)
rm -rf node_modules
npm install
```

---

## Phase 3: Environment Configuration

### Goal
Properly configure environment variables for different environments (local, production).

### Environment Files

**Local Development:** `.env.local` (NOT committed to git)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Production (Vercel):** Set via Vercel Dashboard

### Steps

#### 3.1 Verify Local Environment
```bash
# Check if .env.local exists
cat .env.local

# Verify it's in .gitignore
grep ".env.local" .gitignore
```

#### 3.2 Document Required Variables
Create/update `.env.example` (this SHOULD be committed):
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 3.3 Prepare for Production
**Before deploying, ensure:**
- All required environment variables are documented
- No hardcoded secrets in the codebase
- API URLs use environment variables (not hardcoded localhost)

---

## Phase 4: Deployment to Vercel

### Goal
Deploy the NotAmerican app to Vercel for public access.

### Prerequisites
- Vercel account created
- Code pushed to GitHub
- Environment variables documented

### Steps

#### 4.1 Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

#### 4.2 Login to Vercel
```bash
vercel login
```

#### 4.3 Deploy via CLI
```bash
cd /Users/mishazh/Desktop/APP/notamerican

# First deployment (interactive)
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy

# Subsequent deployments
vercel --prod
```

#### 4.4 Deploy via Vercel Dashboard (Alternative)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click "Deploy"

### Post-Deployment Verification

#### 4.5 Test Production Site
```bash
# Get deployment URL from Vercel
# Visit: https://notamerican.vercel.app (or your custom domain)
```

**Checklist:**
- [ ] Home page loads
- [ ] Authentication works (login/signup)
- [ ] Games load and function correctly
- [ ] Database operations succeed
- [ ] No console errors
- [ ] PWA install prompt appears (on mobile)

#### 4.6 Monitor Deployment
```bash
# View logs via CLI
vercel logs <deployment-url>

# Or check Vercel Dashboard → Project → Deployments → Logs
```

---

## Phase 5: Continuous Deployment

### Goal
Set up automatic deployments when code is pushed to GitHub.

### Steps

#### 5.1 Configure Git Integration (Vercel Dashboard)
1. Go to Project Settings → Git
2. Enable "Automatic Deployments"
3. Configure branch deployments:
   - **Production Branch:** `main`
   - **Preview Branches:** All other branches

#### 5.2 Deployment Workflow
```bash
# Make changes locally
# Test thoroughly

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically deploys
# Check deployment status at vercel.com/dashboard
```

#### 5.3 Preview Deployments (Feature Branches)
```bash
# Create feature branch
git checkout -b feature/new-game

# Make changes and push
git push origin feature/new-game

# Vercel creates preview deployment
# Test at: https://notamerican-<hash>.vercel.app

# Merge to main when ready
git checkout main
git merge feature/new-game
git push origin main
```

---

## Phase 6: Production Monitoring

### Goal
Monitor production health and respond to issues.

### Monitoring Checklist

#### 6.1 Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor page load times
- Track Core Web Vitals

#### 6.2 Error Tracking
```bash
# Check Vercel logs for errors
vercel logs --prod

# Look for:
# - 500 errors (server errors)
# - 404 errors (missing pages)
# - API failures
# - Database connection issues
```

#### 6.3 Supabase Monitoring
- Check Supabase Dashboard → Database → Logs
- Monitor query performance
- Check connection pool usage

#### 6.4 Regular Health Checks
**Daily:**
- [ ] Site is accessible
- [ ] No critical errors in logs
- [ ] Database is responding

**Weekly:**
- [ ] Review analytics
- [ ] Check for performance degradation
- [ ] Update dependencies (if needed)

---

## Phase 7: Rollback Procedures

### Goal
Quickly revert to a working version if deployment fails.

### Steps

#### 7.1 Rollback via Vercel Dashboard
1. Go to Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

#### 7.2 Rollback via Git
```bash
# Find the last working commit
git log --oneline

# Revert to that commit
git revert <commit-hash>
git push origin main

# Vercel will auto-deploy the reverted version
```

#### 7.3 Emergency Hotfix
```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix the issue
# Test locally

# Commit and push
git commit -m "fix: critical bug"
git push origin hotfix/critical-bug

# Merge to main immediately
git checkout main
git merge hotfix/critical-bug
git push origin main
```

---

## Common Commands Reference

### Git Operations
```bash
# Status and info
git status
git log --oneline -10
git branch

# Staging and committing
git add <file>
git commit -m "message"
git push origin <branch>

# Branching
git checkout -b <new-branch>
git checkout <existing-branch>
git merge <branch>

# Undoing changes
git reset HEAD~1  # Undo last commit (keep changes)
git reset --hard HEAD~1  # Undo last commit (discard changes)
git revert <commit-hash>  # Create new commit that undoes changes
```

### Server Management
```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Clean up
rm -rf .next
rm -rf node_modules && npm install
```

### Vercel CLI
```bash
# Deploy
vercel  # Preview deployment
vercel --prod  # Production deployment

# Logs
vercel logs
vercel logs --prod

# Environment variables
vercel env ls
vercel env add <name>
vercel env rm <name>
```

---

## Troubleshooting

### Build Failures

**Symptom:** Deployment fails during build
```bash
# Check build locally
npm run build

# Common issues:
# - TypeScript errors → Fix type issues
# - Missing dependencies → npm install
# - Environment variables → Check Vercel settings
```

### Runtime Errors

**Symptom:** Site deploys but crashes on load
```bash
# Check Vercel logs
vercel logs --prod

# Common issues:
# - Database connection → Check Supabase env vars
# - API route errors → Check API implementation
# - Missing environment variables → Add to Vercel
```

### Performance Issues

**Symptom:** Site is slow
```bash
# Check Vercel Analytics
# Look for:
# - Large bundle sizes → Use dynamic imports
# - Slow API calls → Optimize database queries
# - Unoptimized images → Use Next.js Image component
```

---

## Integration with Other Agents

### Agent A (Gameplay)
- **Receives:** New game features, UI updates
- **Provides:** Deployment status, production URLs for testing

### Agent B (Authentication & Data)
- **Receives:** Database schema changes, auth updates
- **Provides:** Environment variable requirements, production database access

### Coordination
- Agent C deploys changes from both Agent A and Agent B
- Ensures all changes are tested before production deployment
- Manages database migrations in production

---

## Success Criteria

Agent C has successfully completed its mission when:

1. ✅ All code is committed and pushed to GitHub
2. ✅ Production build succeeds without errors
3. ✅ App is deployed to Vercel and publicly accessible
4. ✅ All environment variables are properly configured
5. ✅ Automatic deployments are working (push to main = deploy)
6. ✅ Monitoring is in place and no critical errors
7. ✅ Rollback procedures are documented and tested
8. ✅ Team knows how to deploy updates independently

---

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Purchase domain (e.g., notamerican.com)
   - Add to Vercel project settings
   - Configure DNS

2. **Performance Optimization**
   - Enable Vercel Edge Functions
   - Set up CDN for static assets
   - Optimize images and fonts

3. **Monitoring & Alerts**
   - Set up Vercel notifications
   - Configure Supabase alerts
   - Add error tracking (Sentry, LogRocket)

4. **CI/CD Enhancements**
   - Add automated tests
   - Set up staging environment
   - Configure deployment previews for PRs

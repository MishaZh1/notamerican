---
description: How to deploy NotAmerican to Vercel
---

# Deploying to Vercel

Since your project uses **Next.js**, **Vercel** is the best place to host it. It offers zero-config deployment and automatic HTTPS (required for your PWA to work).

## Prerequisites
- A [Vercel Account](https://vercel.com/signup)
- Your project pushed to GitHub (We just did this!)

## Step 1: Import Project
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Select **"Continue with GitHub"**.
4. Find your repository `notamerican` in the list and click **"Import"**.

## Step 2: Configure Environment Variables
**CRITICAL:** Your app needs to talk to Supabase.

1. On the Vercel "Configure Project" screen, look for the **"Environment Variables"** section.
2. Open your local `.env.local` file.
3. Copy and paste the following keys one by one into Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Required for your Admin/Seeding actions)

## Step 3: Deploy
1. Click **"Deploy"**.
2. Vercel will build your project (it takes about 1 minute).
3. Once done, you will get a live URL (e.g., `notamerican.vercel.app`).

## Step 4: Verify PWA
1. Open the live URL on your phone.
2. You should see the "Add to Home Screen" prompt (or use the Share menu on iOS).
3. The app will install as a standalone app with your new Brain/Eagle icon!

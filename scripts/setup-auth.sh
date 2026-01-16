#!/bin/bash

# =====================================================
# NotAmerican - Supabase Setup Helper Script
# =====================================================
# This script helps you set up the Supabase database
# and provides instructions for OAuth configuration
# =====================================================

set -e

echo "🚀 NotAmerican - Supabase Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000"
    echo ""
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Load environment variables
source .env.local

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo "Would you like to install it? (y/n)"
    read -r install_cli
    
    if [ "$install_cli" = "y" ]; then
        echo "Installing Supabase CLI..."
        npm install -g supabase
        echo "✅ Supabase CLI installed"
    else
        echo "Skipping CLI installation. You can install it later with:"
        echo "npm install -g supabase"
    fi
fi

echo ""
echo "📊 Database Setup"
echo "================================"
echo ""
echo "To set up your database, you have two options:"
echo ""
echo "Option 1: Manual Setup (Recommended for first-time setup)"
echo "  1. Go to your Supabase project dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Copy the contents of: supabase/migrations/001_complete_setup.sql"
echo "  4. Paste and run the SQL"
echo ""
echo "Option 2: Using Supabase CLI"
echo "  Run: supabase db push"
echo ""
echo "Press Enter to continue..."
read -r

echo ""
echo "🔐 OAuth Configuration"
echo "================================"
echo ""
echo "To enable Google OAuth:"
echo ""
echo "1. Go to Supabase Dashboard → Authentication → Providers"
echo "2. Enable 'Google' provider"
echo ""
echo "3. Create Google OAuth credentials:"
echo "   a. Go to: https://console.cloud.google.com/"
echo "   b. Create a new project or select existing"
echo "   c. Enable Google+ API"
echo "   d. Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client ID'"
echo "   e. Application type: Web application"
echo "   f. Add Authorized redirect URI:"
echo "      ${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback"
echo ""
echo "4. Copy Client ID and Client Secret to Supabase"
echo "5. Save the configuration"
echo ""
echo "Press Enter to continue..."
read -r

echo ""
echo "🌐 Site URL Configuration"
echo "================================"
echo ""
echo "In Supabase Dashboard → Authentication → URL Configuration:"
echo ""
echo "Site URL: ${NEXT_PUBLIC_SITE_URL}"
echo ""
echo "Redirect URLs:"
echo "  - ${NEXT_PUBLIC_SITE_URL}/auth/callback"
echo "  - http://localhost:3000/auth/callback (for development)"
echo ""
echo "Press Enter to continue..."
read -r

echo ""
echo "✅ Setup Instructions Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Complete the database setup (Option 1 or 2 above)"
echo "2. Configure Google OAuth in Supabase"
echo "3. Set up Site URL and Redirect URLs"
echo "4. Run: npm run dev"
echo "5. Navigate to: http://localhost:3000/login"
echo ""
echo "For detailed documentation, see: AUTH_SETUP.md"
echo ""
echo "🎉 Happy coding!"

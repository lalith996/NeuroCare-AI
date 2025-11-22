#!/bin/bash

# NeuroCare AI - Quick Deploy to Railway
# This script helps you deploy to Railway

echo "🚀 NeuroCare AI - Railway Deployment Helper"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - NeuroCare AI"
else
    echo "✓ Git repository already initialized"
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found."
    echo ""
    echo "Install Railway CLI:"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "Or deploy via GitHub:"
    echo "  1. Push code to GitHub"
    echo "  2. Go to https://railway.app"
    echo "  3. Click 'Start a New Project'"
    echo "  4. Select 'Deploy from GitHub repo'"
    echo "  5. Choose your repository"
    echo ""
    exit 1
fi

echo "✓ Railway CLI found"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize project
echo ""
echo "📦 Initializing Railway project..."
railway init

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."
echo "Enter your Neon DATABASE_URL:"
read -r DATABASE_URL
railway variables set DATABASE_URL="$DATABASE_URL"

echo "Generating JWT_SECRET..."
JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
railway variables set JWT_SECRET="$JWT_SECRET"

# Deploy
echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is deploying..."
echo "Run 'railway open' to view your app"
echo ""
echo "📝 Don't forget to update frontend BASE URL with your Railway URL"

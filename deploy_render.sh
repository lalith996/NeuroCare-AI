#!/bin/bash

# NeuroCare AI - Quick Deploy to Render.com
# This script helps you deploy to Render

echo "🚀 NeuroCare AI - Render Deployment Helper"
echo "=========================================="
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

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "⚠️  No git remote found."
    echo "Please create a GitHub repository and add it as remote:"
    echo ""
    echo "  git remote add origin https://github.com/yourusername/neurocare-ai.git"
    echo "  git push -u origin main"
    echo ""
    echo "Then go to render.com and:"
    echo "  1. Click 'New +' → 'Web Service'"
    echo "  2. Connect your GitHub repository"
    echo "  3. Render will auto-detect render.yaml"
    echo "  4. Add environment variables:"
    echo "     - DATABASE_URL: (your Neon connection string)"
    echo "     - JWT_SECRET: (generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))')"
    echo "  5. Click 'Create Web Service'"
    echo ""
else
    echo "✓ Git remote configured"
    echo ""
    echo "📤 Pushing to GitHub..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
    git push origin main
    echo ""
    echo "✅ Code pushed to GitHub!"
    echo ""
    echo "🌐 Next steps:"
    echo "  1. Go to https://render.com"
    echo "  2. Click 'New +' → 'Web Service'"
    echo "  3. Connect your GitHub repository"
    echo "  4. Render will auto-detect render.yaml"
    echo "  5. Add environment variables in Render dashboard"
    echo "  6. Click 'Create Web Service'"
    echo ""
fi

echo "📝 Don't forget to:"
echo "  - Set DATABASE_URL in Render dashboard"
echo "  - Set JWT_SECRET in Render dashboard"
echo "  - Update frontend BASE URL after deployment"
echo ""
echo "🎉 Happy deploying!"

# 🚀 Vercel Deployment Guide for NeuroCare AI

## ⚠️ Important Note

Vercel is best suited for **frontend only**. For the full-stack app, we recommend:
- **Frontend on Vercel** (client/)
- **Backend on Render/Railway** (server/)

However, if you want to deploy both on Vercel, follow this guide.

---

## Option 1: Frontend Only on Vercel (Recommended)

### Step 1: Deploy Backend Elsewhere

Deploy your backend to Render, Railway, or Heroku first:
- [Render Deployment](DEPLOY_NOW.md)
- Get your backend URL (e.g., `https://neurocare-api.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Push to GitHub** (already done ✅)

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL: `https://neurocare-ai.vercel.app`

---

## Option 2: Full Stack on Vercel (Advanced)

### Prerequisites
- Vercel Pro account (for longer build times)
- Backend must be serverless-compatible

### Step 1: Update Project Structure

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

### Step 2: Add Environment Variables in Vercel Dashboard

Go to Project Settings → Environment Variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET = your-secure-jwt-secret-here
NODE_ENV = production
CORS_ORIGIN = https://your-vercel-app.vercel.app
```

### Step 3: Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🔧 Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project
2. Click "Settings"
3. Click "Environment Variables"
4. Add these variables:

#### For Frontend Only:
```
VITE_API_URL = https://your-backend-url.com/api
```

#### For Full Stack:
```
DATABASE_URL = postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET = <generate-secure-secret>
NODE_ENV = production
CORS_ORIGIN = https://your-app.vercel.app
VITE_API_URL = /api
```

---

## 🎯 Recommended Architecture

### Best Practice Setup:

```
Frontend (Vercel)
    ↓
Backend (Render/Railway)
    ↓
Database (Neon PostgreSQL)
```

**Why?**
- ✅ Vercel excels at static sites and frontend
- ✅ Render/Railway better for Node.js backends
- ✅ Easier to scale independently
- ✅ Better performance
- ✅ Simpler configuration

---

## 📝 Quick Deploy Commands

### Frontend to Vercel:
```bash
cd client
vercel --prod
```

### Backend to Render:
```bash
# Push to GitHub
git push origin main

# Then connect in Render dashboard
# https://dashboard.render.com
```

---

## 🐛 Troubleshooting

### Error: "Environment Variable references Secret"
**Solution:** Don't use `@secret_name` syntax in `vercel.json`. Add variables directly in Vercel dashboard.

### Error: "DEPLOYMENT_NOT_FOUND"
**Solution:** 
1. Delete `vercel.json` if deploying frontend only
2. Or update it with correct configuration
3. Redeploy

### Error: "Build failed"
**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `client/` directory has correct structure
3. Verify `package.json` has build script

### CORS Errors
**Solution:**
1. Update `CORS_ORIGIN` in backend to match Vercel URL
2. Ensure backend allows your Vercel domain

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render/Railway
- [ ] Backend URL obtained
- [ ] Environment variables set in Vercel
- [ ] `VITE_API_URL` points to backend
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] Database accessible from backend
- [ ] Test login functionality
- [ ] Test API endpoints

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

## 💡 Pro Tips

1. **Use Vercel for frontend only** - It's what it does best
2. **Deploy backend to Render** - Free tier available, great for Node.js
3. **Use environment variables** - Never hardcode secrets
4. **Enable automatic deployments** - Deploy on every push to main
5. **Set up preview deployments** - Test PRs before merging

---

**Need help?** Check the [main deployment guide](DEPLOYMENT.md) or open an issue on GitHub.

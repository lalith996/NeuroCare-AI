# NeuroCare AI - Deployment Guide

## 🚀 Quick Deploy Options

Your NeuroCare AI platform can be deployed to several platforms. Choose the one that fits your needs:

### Option 1: Render.com (Recommended - Free Tier Available)

**Why Render?**
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Built-in health checks
- ✅ Environment variables management

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/neurocare-ai.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`
   - Add environment variables:
     - `DATABASE_URL`: Your Neon connection string
     - `JWT_SECRET`: Generate a secure random string
   - Click "Create Web Service"

3. **Update Frontend URLs**
   - Once deployed, you'll get a URL like: `https://neurocare-api.onrender.com`
   - Update `BASE` variable in all HTML files:
     ```javascript
     const BASE = "https://neurocare-api.onrender.com";
     ```

4. **Deploy Frontend**
   - Option A: Use Render Static Site for frontend
   - Option B: Use Netlify/Vercel for frontend
   - Option C: Serve frontend from same backend (add static files route)

---

### Option 2: Railway.app (Easy & Fast)

**Why Railway?**
- ✅ $5 free credit monthly
- ✅ One-click deploy
- ✅ Automatic deployments
- ✅ Built-in PostgreSQL (optional)

**Steps:**

1. **Push to GitHub** (same as above)

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect `railway.json`
   - Add environment variables:
     - `DATABASE_URL`: Your Neon connection string
     - `JWT_SECRET`: Generate a secure string
   - Click "Deploy"

3. **Get Your URL**
   - Railway will provide a URL like: `https://neurocare-ai.up.railway.app`
   - Update frontend `BASE` variable

---

### Option 3: Vercel (Serverless)

**Why Vercel?**
- ✅ Free tier
- ✅ Excellent for frontend
- ✅ Global CDN
- ✅ Automatic HTTPS

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   ```

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

---

### Option 4: Heroku (Classic)

**Why Heroku?**
- ✅ Well-documented
- ✅ Many add-ons
- ✅ Easy scaling

**Steps:**

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from heroku.com
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create neurocare-ai
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set DATABASE_URL="postgresql://..."
   heroku config:set JWT_SECRET="your-secret-key"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Open App**
   ```bash
   heroku open
   ```

---

### Option 5: DigitalOcean App Platform

**Why DigitalOcean?**
- ✅ $200 free credit for 60 days
- ✅ Full control
- ✅ Scalable
- ✅ Managed databases

**Steps:**

1. **Push to GitHub** (same as above)

2. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub repository
   - Configure:
     - Build Command: `pip install -r requirements.txt`
     - Run Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8080`
   - Add environment variables
   - Click "Create Resources"

---

## 🌐 Frontend Deployment Options

### Option A: Netlify (Recommended for Frontend)

1. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   cd frontend
   netlify deploy --prod
   ```

2. **Or use Netlify Drop**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your `frontend` folder
   - Done!

### Option B: Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### Option C: GitHub Pages

1. **Create `frontend/.nojekyll` file**
2. **Push to GitHub**
3. **Enable GitHub Pages** in repository settings
4. **Access at**: `https://yourusername.github.io/neurocare-ai/`

### Option D: Serve from Backend

Add to `backend/main.py`:

```python
from fastapi.staticfiles import StaticFiles

# Serve frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
```

---

## 🔧 Configuration Checklist

Before deploying, ensure:

- [ ] Database schema created on Neon
- [ ] Demo data loaded (optional)
- [ ] Environment variables set
- [ ] Frontend BASE URL updated
- [ ] CORS origins configured for production
- [ ] JWT secret is strong and secure
- [ ] SSL/HTTPS enabled
- [ ] Health check endpoint working

---

## 🔐 Security for Production

1. **Change JWT Secret**
   ```bash
   # Generate a secure secret
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Update CORS Settings**
   In `backend/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],  # Specific domain
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Use Environment Variables**
   Never commit secrets to Git!

4. **Enable Rate Limiting**
   ```bash
   pip install slowapi
   ```

---

## 📊 Monitoring & Logs

### Render
- View logs: Dashboard → Your Service → Logs
- Metrics: Dashboard → Your Service → Metrics

### Railway
- View logs: Project → Deployments → Logs
- Metrics: Project → Metrics

### Heroku
```bash
heroku logs --tail
```

---

## 🚀 Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying NeuroCare AI..."

# Update frontend URLs
echo "📝 Updating frontend URLs..."
BACKEND_URL="https://your-backend-url.com"
find frontend -name "*.html" -exec sed -i '' "s|http://127.0.0.1:8000|$BACKEND_URL|g" {} \;

# Deploy backend
echo "🔧 Deploying backend..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

# Deploy to Render/Railway/Heroku
# (Platform-specific commands here)

echo "✅ Deployment complete!"
echo "🌐 Backend: $BACKEND_URL"
echo "🌐 Frontend: https://your-frontend-url.com"
```

---

## 🧪 Test Deployment

After deployment, test:

1. **Backend Health**
   ```bash
   curl https://your-backend-url.com/
   ```

2. **Login Endpoint**
   ```bash
   curl -X POST https://your-backend-url.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"doctor@demo.com","password":"doctor123"}'
   ```

3. **Frontend**
   - Open frontend URL in browser
   - Try logging in
   - Check browser console for errors

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Render | 750 hrs/month | $7/month | Full-stack apps |
| Railway | $5 credit/month | $5/month | Quick deploys |
| Vercel | Unlimited | $20/month | Serverless |
| Heroku | 550 hrs/month | $7/month | Classic apps |
| Netlify | 100GB/month | $19/month | Static sites |

---

## 🆘 Troubleshooting

### "Application Error" on startup
- Check logs for Python errors
- Verify all dependencies in `requirements.txt`
- Ensure `DATABASE_URL` is set correctly

### CORS errors in browser
- Update `allow_origins` in `backend/main.py`
- Ensure frontend URL is whitelisted

### Database connection fails
- Verify Neon connection string
- Check if IP is whitelisted (Neon allows all by default)
- Ensure SSL mode is `require`

### 502 Bad Gateway
- Check if app is listening on correct port (`$PORT`)
- Verify health check endpoint works
- Check memory/CPU limits

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com)
- [Neon Docs](https://neon.tech/docs)

---

## ✅ Post-Deployment

After successful deployment:

1. Update README with live URLs
2. Test all features end-to-end
3. Monitor logs for errors
4. Set up uptime monitoring (UptimeRobot, etc.)
5. Configure custom domain (optional)
6. Set up CI/CD for automatic deployments

---

**Your NeuroCare AI platform is ready to go live! 🎉**

Choose your preferred platform and follow the steps above.

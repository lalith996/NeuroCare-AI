# 🚀 NeuroCare AI - Deployment Checklist

## Pre-Deployment

- [ ] All code committed to git
- [ ] Database schema created on Neon
- [ ] Demo data loaded (optional)
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Secrets not committed to git

## Backend Deployment

### Choose Your Platform:
- [ ] Render.com (Recommended)
- [ ] Railway.app
- [ ] Vercel
- [ ] Heroku
- [ ] DigitalOcean

### Configuration:
- [ ] `requirements.txt` up to date
- [ ] `runtime.txt` specifies Python version
- [ ] Platform config file created (render.yaml, railway.json, etc.)
- [ ] Health check endpoint working (`/` or `/health`)
- [ ] Start command configured: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables:
- [ ] `DATABASE_URL` set (Neon PostgreSQL connection string)
- [ ] `JWT_SECRET` set (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] `ENVIRONMENT` set to `production` (optional)

### Security:
- [ ] JWT secret is strong and unique
- [ ] CORS origins restricted to your domain
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] No hardcoded secrets in code

## Frontend Deployment

### Option A: Netlify
- [ ] Create Netlify account
- [ ] Deploy `frontend` folder
- [ ] Get deployment URL
- [ ] Update `BASE` variable in all HTML files

### Option B: Vercel
- [ ] Create Vercel account
- [ ] Deploy `frontend` folder
- [ ] Get deployment URL
- [ ] Update `BASE` variable in all HTML files

### Option C: GitHub Pages
- [ ] Enable GitHub Pages in repo settings
- [ ] Set source to `main` branch, `/frontend` folder
- [ ] Get GitHub Pages URL
- [ ] Update `BASE` variable in all HTML files

### Option D: Same Backend
- [ ] Add static files route to `backend/main.py`
- [ ] Frontend served from backend URL

## Update Frontend URLs

After backend is deployed, update `BASE` in these files:

- [ ] `frontend/doctor_dashboard_v2.html`
- [ ] `frontend/patient_dashboard.html`
- [ ] `frontend/login_doctor.html`
- [ ] `frontend/login_patient.html`
- [ ] `frontend/doctor_dashboard.html` (old version)

Change from:
```javascript
const BASE = "http://127.0.0.1:8000";
```

To:
```javascript
const BASE = "https://your-backend-url.com";
```

## Testing Deployment

### Backend Tests:
- [ ] Health check: `curl https://your-backend-url.com/`
- [ ] Login endpoint: `curl -X POST https://your-backend-url.com/auth/login -H "Content-Type: application/json" -d '{"email":"doctor@demo.com","password":"doctor123"}'`
- [ ] Get patients: Test with token
- [ ] CORS working from frontend domain

### Frontend Tests:
- [ ] Doctor login works
- [ ] Patient login works
- [ ] Doctor can view patients
- [ ] Doctor can assign games
- [ ] Patient can view assigned games
- [ ] Scores are recorded
- [ ] Reports can be generated
- [ ] No console errors

### End-to-End Test:
- [ ] Complete doctor workflow
- [ ] Complete patient workflow
- [ ] Game score submission
- [ ] Prediction generation
- [ ] Report generation and viewing

## Post-Deployment

### Documentation:
- [ ] Update README with live URLs
- [ ] Document deployment process
- [ ] Add troubleshooting notes

### Monitoring:
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation
- [ ] Monitor database usage

### Performance:
- [ ] Test response times
- [ ] Check database query performance
- [ ] Verify connection pooling working
- [ ] Test under load (optional)

### Security:
- [ ] SSL/HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled (optional)
- [ ] Input validation working

### Backup:
- [ ] Database backup configured (Neon has automatic backups)
- [ ] Code backed up on GitHub
- [ ] Environment variables documented securely

## Optional Enhancements

- [ ] Custom domain configured
- [ ] CDN enabled for frontend
- [ ] Email notifications set up
- [ ] Analytics integrated
- [ ] CI/CD pipeline configured
- [ ] Staging environment created

## Rollback Plan

If deployment fails:
- [ ] Keep previous version accessible
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Have database backup ready

## Support & Maintenance

- [ ] Document common issues
- [ ] Create support contact
- [ ] Schedule regular updates
- [ ] Monitor for security updates
- [ ] Plan for scaling

---

## Quick Deploy Commands

### Render (via GitHub):
```bash
git add .
git commit -m "Deploy to production"
git push origin main
# Then connect repo in Render dashboard
```

### Railway:
```bash
railway login
railway init
railway up
```

### Vercel:
```bash
vercel --prod
```

### Heroku:
```bash
git push heroku main
```

---

## Environment Variables Template

Copy to your deployment platform:

```
DATABASE_URL=postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<generate-with-python-secrets>
ENVIRONMENT=production
```

---

## Success Criteria

Your deployment is successful when:
- ✅ Backend responds to health check
- ✅ Frontend loads without errors
- ✅ Users can login (doctor & patient)
- ✅ All API endpoints working
- ✅ Database connections stable
- ✅ No CORS errors
- ✅ HTTPS enabled
- ✅ Monitoring active

---

**Ready to deploy? Follow this checklist step by step! 🚀**

# Vercel Deployment Guide for NeuroCare AI

## Overview
NeuroCare AI deploys both frontend (Next.js) and backend (Node.js) on Vercel.

## Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/next"
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
      "dest": "client/$1"
    }
  ]
}
```

## What Deploys:

1. **Frontend** - Next.js app from `client/` → Serves UI
2. **Backend** - Node.js API from `server/` → Serverless functions at `/api/*`

## Environment Variables (Set in Vercel Dashboard)

### Backend:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend:
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret
```

## Deployment Steps:

1. Connect GitHub repo to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push to main

## Health Check:
```
GET https://your-app.vercel.app/api/health
```

**Both frontend and backend deploy together! 🚀**

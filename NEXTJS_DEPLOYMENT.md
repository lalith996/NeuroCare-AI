# Next.js Frontend Deployment Guide

This guide covers deploying the NeuroCare AI Next.js frontend to various platforms.

## Prerequisites

- Node.js 18+ installed
- Backend API running (or deployed)
- Git repository set up

## Local Development

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Next.js frontend"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set root directory to `client`

3. **Configure Environment Variables**

   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Get your production URL

#### vercel.json Configuration

Create `client/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### Option 2: Netlify

1. **Build Configuration**

   Create `client/netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables
   - Deploy!

### Option 3: Docker

1. **Build Docker Image**
   ```bash
   cd client
   docker build -t neurocare-frontend .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=http://localhost:5001 \
     -e NEXTAUTH_URL=http://localhost:3000 \
     -e NEXTAUTH_SECRET=your-secret \
     neurocare-frontend
   ```

3. **Docker Compose**

   Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./client
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:5001
         - NEXTAUTH_URL=http://localhost:3000
         - NEXTAUTH_SECRET=your-secret
       depends_on:
         - backend

     backend:
       build: ./server
       ports:
         - "5001:5001"
       environment:
         - DATABASE_URL=your-db-url
         - JWT_SECRET=your-jwt-secret
   ```

   Run:
   ```bash
   docker-compose up -d
   ```

### Option 4: AWS Amplify

1. **Connect GitHub Repository**
   - Go to AWS Amplify Console
   - Click "New App" → "Host web app"
   - Connect GitHub repository
   - Select `client` as root directory

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd client
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL`
   - Add `NEXTAUTH_URL`
   - Add `NEXTAUTH_SECRET`

4. **Deploy**

### Option 5: Self-Hosted (VPS/Cloud Server)

#### Using PM2

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Build Application**
   ```bash
   cd client
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "neurocare-frontend" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy**

   Create `/etc/nginx/sites-available/neurocare`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/neurocare /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.neurocare.com` |
| `NEXTAUTH_URL` | Frontend URL | `https://app.neurocare.com` |
| `NEXTAUTH_SECRET` | Secret for auth | `random-secure-string` |

### Generating Secrets

```bash
# Generate secure secret
openssl rand -base64 32
```

## Performance Optimization

### 1. Enable Compression

Next.js automatically compresses responses. No additional config needed.

### 2. Image Optimization

Next.js Image component is already used. Make sure to configure:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 3. Code Splitting

Already enabled by default in Next.js.

### 4. Caching

Configure caching headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## Monitoring & Analytics

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard@latest -i nextjs
```

## Troubleshooting

### Build Fails

1. Check Node.js version: `node -v` (should be 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check environment variables

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check CORS settings on backend
3. Verify backend is accessible from frontend

### Deployment Slow

1. Enable caching for `node_modules`
2. Use `npm ci` instead of `npm install`
3. Check build logs for bottlenecks

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Enable CORS properly on backend
- [ ] Use environment variables for secrets
- [ ] Enable CSP headers
- [ ] Keep dependencies updated
- [ ] Use secure cookies in production

## Scaling

### Horizontal Scaling

Deploy multiple instances behind a load balancer:

```nginx
upstream nextjs_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://nextjs_backend;
    }
}
```

### CDN Integration

Use CDN for static assets:
- Vercel automatically provides CDN
- For custom: Use CloudFlare or AWS CloudFront

## Maintenance

### Updating Dependencies

```bash
cd client
npm outdated
npm update
npm audit fix
```

### Backup Strategy

- Database backups (if any)
- Environment variables backup
- Regular git commits

## Support

For issues:
1. Check [Next.js Documentation](https://nextjs.org/docs)
2. Review application logs
3. Contact support team

---

**Built with ❤️ by the NeuroCare AI Team**

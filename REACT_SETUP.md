# NeuroCare AI - React + TypeScript + Node.js Setup

## 🎉 Complete Modern Stack Migration

Your NeuroCare AI platform has been converted to:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) - unchanged
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6

## 📁 New Project Structure

```
NeuroCare_AI/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   └── doctor/       # Doctor-specific components
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   └── PatientDashboard.tsx
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios instance
│   │   │   └── utils.ts      # Utility functions
│   │   ├── store/
│   │   │   └── authStore.ts  # Zustand auth store
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── doctor.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── score.controller.ts
│   │   │   └── prediction.controller.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── doctor.routes.ts
│   │   │   ├── patient.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   ├── score.routes.ts
│   │   │   └── prediction.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── package.json              # Root workspace config
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, server, client)
npm run install:all

# Or install individually
npm install              # Root
cd server && npm install # Server
cd client && npm install # Client
```

### 2. Environment Setup

**Server (.env):**
```bash
cd server
cp .env.example .env
# Edit .env with your values
```

**Client (.env):**
```bash
cd client
cp .env.example .env
# Default: VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development

```bash
# From root directory - starts both server and client
npm run dev

# Or start individually
npm run dev:server  # Server on port 5000
npm run dev:client  # Client on port 5173
```

### 4. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 🎨 UI Components (Shadcn UI)

Pre-installed components:
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Tabs
- ✅ Toast
- ✅ Checkbox

Add more components:
```bash
cd client
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
```

## 📦 Key Dependencies

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `axios` - HTTP client
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `@radix-ui/*` - Headless UI components
- `react-hook-form` - Forms
- `zod` - Validation

### Backend
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT auth
- `express-validator` - Input validation
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - Logging

## 🔧 Development Scripts

```bash
# Root
npm run dev          # Start both server and client
npm run build        # Build both
npm run start        # Start production server

# Server
cd server
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm run start        # Start compiled server

# Client
cd client
npm run dev          # Development with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🎯 Features Implemented

### Authentication
- ✅ JWT-based auth
- ✅ Role-based access (doctor/patient)
- ✅ Protected routes
- ✅ Persistent login (localStorage)
- ✅ Auto token refresh

### Doctor Dashboard
- ✅ View assigned patients
- ✅ Assign games to patients
- ✅ View patient scores
- ✅ Generate reports
- ✅ View predictions

### Patient Dashboard
- ✅ View assigned games
- ✅ Play games (UI ready)
- ✅ Upload documents (backend ready)
- ✅ View reports

### API Endpoints
- ✅ `/api/auth/*` - Authentication
- ✅ `/api/doctor/*` - Doctor operations
- ✅ `/api/patient/*` - Patient operations
- ✅ `/api/reports/*` - Report generation
- ✅ `/api/scores/*` - Score submission
- ✅ `/api/predictions/*` - ML predictions

## 🔐 Demo Credentials

**Doctor:**
- Email: `doctor@demo.com`
- Password: `doctor123`

**Patients:**
- Email: `patient1@demo.com` / Password: `patient123`
- Email: `patient2@demo.com` / Password: `patient123`
- Email: `patient3@demo.com` / Password: `patient123`

## 🎨 Customization

### Theme Colors
Edit `client/src/index.css` to customize colors:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Add New Pages
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation links

### Add New API Endpoints
1. Create controller in `server/src/controllers/`
2. Create route in `server/src/routes/`
3. Register route in `server/src/index.ts`

## 🚀 Production Build

```bash
# Build everything
npm run build

# Server will be in server/dist/
# Client will be in client/dist/

# Start production server
cd server
npm start

# Serve client with nginx or serve from Express
```

## 📊 Database

Database schema remains the same (Neon PostgreSQL).
No migration needed - same tables, same data.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
- Check `CORS_ORIGIN` in server `.env`
- Ensure client URL matches

### TypeScript Errors
```bash
# Rebuild
npm run build

# Check types
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

## 📚 Next Steps

1. ✅ Complete game implementations
2. ✅ Add file upload UI
3. ✅ Implement ML prediction integration
4. ✅ Add real-time notifications
5. ✅ Add data visualization charts
6. ✅ Implement report PDF export
7. ✅ Add email notifications
8. ✅ Deploy to production

## 🎉 You're Ready!

Your modern React + TypeScript + Node.js stack is ready to use!

Start development:
```bash
npm run dev
```

Then open http://localhost:5173 and login!

# 🧠 NeuroCare AI - Modern Stack Edition

**Cognitive Assessment Platform for Alzheimer's & MCI Screening**

Built with React, TypeScript, Node.js, Express, Tailwind CSS, and Shadcn UI

---

## ✨ Tech Stack

### Frontend
- ⚛️ **React 18** - UI library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🎭 **Shadcn UI** - Component library
- 🔄 **TanStack Query** - Data fetching
- 🗂️ **Zustand** - State management
- 🧭 **React Router v6** - Routing
- 📝 **React Hook Form** - Forms
- ✅ **Zod** - Validation

### Backend
- 🟢 **Node.js** - Runtime
- 🚂 **Express** - Web framework
- 📘 **TypeScript** - Type safety
- 🐘 **PostgreSQL** - Database (Neon)
- 🔐 **JWT** - Authentication
- 🔒 **bcrypt** - Password hashing
- ✔️ **express-validator** - Input validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon account)

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Environment Setup

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

**Client:**
```bash
cd client
cp .env.example .env
# Default API URL is already set
```

### 3. Database Setup

```bash
# Create schema (from root)
python backend/create_neon_schema.py

# Load demo data
python scripts/setup_doctor_patient_demo.py
```

### 4. Start Development

```bash
# From root - starts both server and client
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/health

---

## 🎯 Features

### ✅ Implemented

**Authentication**
- JWT-based authentication
- Role-based access control (Doctor/Patient)
- Protected routes
- Persistent sessions

**Doctor Dashboard**
- View assigned patients
- Assign cognitive games
- View patient scores & statistics
- Generate AI-powered reports
- Track patient progress

**Patient Dashboard**
- View assigned games
- Play cognitive assessments
- Upload medical documents
- View assessment reports

**API**
- RESTful endpoints
- TypeScript types
- Input validation
- Error handling
- CORS configured

---

## 📁 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   └── doctor/    # Doctor components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   ├── store/         # Zustand stores
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, errors
│   │   ├── config/        # Database config
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── package.json           # Root workspace
```

---

## 🔐 Demo Credentials

**Doctor:**
- Email: `doctor@demo.com`
- Password: `doctor123`

**Patients:**
- `patient1@demo.com` / `patient123`
- `patient2@demo.com` / `patient123`
- `patient3@demo.com` / `patient123`

---

## 🛠️ Development

### Available Scripts

```bash
# Root
npm run dev              # Start both server & client
npm run build            # Build both
npm run install:all      # Install all dependencies

# Server (cd server)
npm run dev              # Dev with hot reload
npm run build            # Compile TypeScript
npm run start            # Start production

# Client (cd client)
npm run dev              # Dev with hot reload
npm run build            # Build for production
npm run preview          # Preview build
```

### Add Shadcn UI Components

```bash
cd client
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Doctor
- `GET /api/doctor/patients` - Get my patients
- `POST /api/doctor/assign-games` - Assign games
- `GET /api/doctor/patients/:code/scores` - Get scores

### Patient
- `GET /api/patient/games` - Get assigned games
- `POST /api/patient/upload-document` - Upload document
- `GET /api/patient/documents` - Get documents

### Reports
- `POST /api/reports/generate/:code` - Generate report
- `GET /api/reports/patient/:code/latest` - Get latest report

### Scores
- `POST /api/scores` - Submit game score

### Predictions
- `POST /api/predictions` - Run ML prediction

---

## 🎨 Customization

### Theme Colors

Edit `client/src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;      /* Blue */
  --secondary: 210 40% 96.1%;        /* Light gray */
  --destructive: 0 84.2% 60.2%;      /* Red */
  /* ... */
}
```

### Add New Pages

1. Create in `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation

### Add New API Endpoints

1. Create controller in `server/src/controllers/`
2. Create route in `server/src/routes/`
3. Register in `server/src/index.ts`

---

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Deploy Backend

**Option 1: Render.com**
- Connect GitHub repo
- Set environment variables
- Deploy from `server/` directory

**Option 2: Railway**
```bash
cd server
railway up
```

### Deploy Frontend

**Option 1: Vercel**
```bash
cd client
vercel --prod
```

**Option 2: Netlify**
```bash
cd client
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill port 5000
lsof -ti:5000 | xargs kill -9

# Kill port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
- Check `CORS_ORIGIN` in `server/.env`
- Ensure it matches your frontend URL

### TypeScript Errors
```bash
# Check types
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

### Database Connection
- Verify `DATABASE_URL` in `server/.env`
- Check Neon dashboard for connection string
- Ensure schema `neurocare` exists

---

## 📚 Documentation

- [React Setup Guide](REACT_SETUP.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🎯 Roadmap

- [ ] Complete game implementations
- [ ] Real-time notifications
- [ ] Data visualization charts
- [ ] PDF report export
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Internationalization

---

## 📄 License

Educational/Demo Project

---

## 🙏 Acknowledgments

- Shadcn UI for beautiful components
- Radix UI for accessible primitives
- Tailwind CSS for utility-first styling
- Neon for serverless PostgreSQL

---

**Built with ❤️ for cognitive health assessment**

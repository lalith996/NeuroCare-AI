# 🧠 NeuroCare AI - Cognitive Assessment Platform

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue.svg)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack cognitive assessment platform for Alzheimer's and MCI screening, connecting doctors and patients through gamified cognitive tests.

![NeuroCare AI Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=NeuroCare+AI+Dashboard)

## ✨ Features

### For Doctors
- 👥 **Patient Management** - View and manage assigned patients
- 🎮 **Game Assignment** - Assign specific cognitive games to patients
- 📊 **Score Analytics** - View detailed performance statistics
- 🤖 **AI Predictions** - ML-powered risk assessments
- 📄 **Report Generation** - Generate patient-friendly reports

### For Patients
- 🎯 **Assigned Games** - View games assigned by doctor
- 🧩 **Cognitive Tests** - Play interactive cognitive games
- 📁 **Document Upload** - Upload medical history (optional)
- 📋 **View Reports** - Access assessment reports

### Technical Features
- 🔐 **JWT Authentication** - Secure role-based access
- 🎨 **Modern UI** - Shadcn UI + Tailwind CSS
- ⚡ **Fast Development** - Hot reload with Vite
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Real-time Updates** - TanStack Query for data fetching
- 🛡️ **Type Safety** - Full TypeScript coverage

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon account recommended)

### 1. Clone Repository

```bash
git clone https://github.com/lalith996/NeuroCare-AI.git
cd NeuroCare-AI
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Environment Setup

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

**Client:**
```bash
cd client
cp .env.example .env
# Default API URL is already set
```

### 4. Database Setup

```bash
# Create schema
python backend/create_neon_schema.py

# Load demo data
python scripts/setup_doctor_patient_demo.py
```

### 5. Start Development

```bash
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

---

## 🔐 Demo Credentials

**Doctor:**
- Email: `doctor@demo.com`
- Password: `doctor123`

**Patients:**
- Email: `patient1@demo.com` / Password: `patient123`
- Email: `patient2@demo.com` / Password: `patient123`
- Email: `patient3@demo.com` / Password: `patient123`

---

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 18** - UI library
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🎭 **Shadcn UI** - Component library
- 🔄 **TanStack Query** - Data fetching
- 🗂️ **Zustand** - State management
- 🧭 **React Router v6** - Routing

### Backend
- 🟢 **Node.js** - Runtime
- 🚂 **Express** - Web framework
- 📘 **TypeScript** - Type safety
- 🐘 **PostgreSQL** - Database (Neon)
- 🔐 **JWT** - Authentication
- 🔒 **bcrypt** - Password hashing

---

## 📁 Project Structure

```
NeuroCare_AI/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── store/         # State management
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, errors
│   │   └── config/        # Database config
│   └── package.json
│
├── backend/               # Python backend (legacy)
├── frontend/              # HTML frontend (legacy)
├── ml/                    # ML models
├── data/                  # Sample data
└── docs/                  # Documentation
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Doctor
- `GET /api/doctor/patients` - Get patients
- `POST /api/doctor/assign-games` - Assign games
- `GET /api/doctor/patients/:code/scores` - Get scores

### Patient
- `GET /api/patient/games` - Get assigned games
- `POST /api/patient/upload-document` - Upload document
- `GET /api/patient/documents` - Get documents

### Reports
- `POST /api/reports/generate/:code` - Generate report
- `GET /api/reports/patient/:code/latest` - Get latest report

### Scores & Predictions
- `POST /api/scores` - Submit game score
- `POST /api/predictions` - Run ML prediction

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
```

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)

1. Push to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=5001`
4. Deploy!

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy dist/ folder
```

Or connect GitHub repository for automatic deployments.

---

## 📚 Documentation

- [Quick Start Guide](START_HERE.md)
- [React Setup Guide](REACT_SETUP.md)
- [API Reference](API_REFERENCE.md)
- [Migration Guide](MIGRATION_COMPLETE.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🎯 Roadmap

- [ ] Complete game implementations
- [ ] Real-time notifications
- [ ] Data visualization charts
- [ ] PDF report export
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Lalith Machavarapu**
- GitHub: [@lalith996](https://github.com/lalith996)

---

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com) for beautiful components
- [Radix UI](https://www.radix-ui.com) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Neon](https://neon.tech) for serverless PostgreSQL

---

## 📞 Support

For support, email support@neurocare-ai.com or open an issue on GitHub.

---

**Built with ❤️ for cognitive health assessment**

# NeuroCare AI - Next.js Frontend

A modern, production-ready Next.js 14 frontend for the NeuroCare AI cognitive assessment platform.

## Features

- ⚡ **Next.js 14** with App Router
- 📘 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🎭 **Shadcn UI** component library
- 🔄 **TanStack Query** for data fetching
- 🎬 **Framer Motion** for animations
- 🌓 **Dark Mode** support
- 📱 **PWA** ready
- 🔐 **JWT Authentication**
- 🗂️ **Zustand** for state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on port 5001

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── doctor/            # Doctor dashboard
│   │   ├── patient/           # Patient dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── layout/            # Layout components
│   │   ├── doctor/            # Doctor-specific components
│   │   ├── patient/           # Patient-specific components
│   │   └── providers.tsx      # React Query & Theme providers
│   ├── lib/
│   │   ├── api.ts             # API client & endpoints
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── store/
│       └── authStore.ts       # Zustand auth store
├── public/                     # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Component library
- **Radix UI** - Accessible primitives
- **Framer Motion** - Animation library

### State & Data
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management
- **Axios** - HTTP client

### Development
- **ESLint** - Code linting
- **next-themes** - Dark mode support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Features Overview

### For Doctors
- 📊 Dashboard with patient statistics
- 👥 Patient management
- 🎮 Game assignment
- 📈 Performance analytics
- 🤖 AI predictions
- 📄 Report generation

### For Patients
- 🎯 View assigned games
- 🧩 Play cognitive assessments
- 📊 Track progress
- 📁 Upload documents
- 📋 View reports

### Technical Features
- 🔐 JWT-based authentication
- 🌓 Light/Dark mode toggle
- 📱 Responsive design
- ⚡ Optimized performance
- 🎨 Modern UI/UX
- 🔄 Real-time data updates
- 🛡️ Type-safe codebase

## Demo Credentials

**Doctor:**
- Email: `doctor@demo.com`
- Password: `doctor123`

**Patients:**
- Email: `patient1@demo.com` / Password: `patient123`
- Email: `patient2@demo.com` / Password: `patient123`
- Email: `patient3@demo.com` / Password: `patient123`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy!

### Docker

```bash
# Build image
docker build -t neurocare-frontend .

# Run container
docker run -p 3000:3000 neurocare-frontend
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Lalith Machavarapu**
- GitHub: [@lalith996](https://github.com/lalith996)

---

**Built with ❤️ for cognitive health assessment**

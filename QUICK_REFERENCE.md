# NeuroCare AI - Quick Reference Card

## 🚀 Start the System

```bash
# 1. Create schema (first time only)
python backend/create_neon_schema.py

# 2. Setup demo data (first time only)
python scripts/setup_doctor_patient_demo.py

# 3. Start backend
uvicorn backend.main:app --reload --port 8000
```

## 🔐 Demo Logins

| Role | Email | Password | Patient Code |
|------|-------|----------|--------------|
| Doctor | doctor@demo.com | doctor123 | - |
| Patient 1 | patient1@demo.com | patient123 | 1001 |
| Patient 2 | patient2@demo.com | patient123 | 1002 |
| Patient 3 | patient3@demo.com | patient123 | 1003 |

## 🌐 Frontend URLs

- Doctor Dashboard: `frontend/doctor_dashboard_v2.html`
- Patient Dashboard: `frontend/patient_dashboard.html`
- Doctor Login: `frontend/login_doctor.html`
- Patient Login: `frontend/login_patient.html`

## 📡 Key API Endpoints

```bash
# Login
POST /auth/login
Body: {"email": "doctor@demo.com", "password": "doctor123"}

# Get my patients (doctor)
GET /doctor/my-patients
Header: Authorization: Bearer <token>

# Assign games (doctor)
POST /doctor/assign-games
Body: {"patient_code": 1001, "games": ["memory_match", "attention_maze"]}

# Get assigned games (patient)
GET /patient/my-games
Header: Authorization: Bearer <token>

# Submit score
POST /api/scores
Body: {"patient_id": 1001, "game": "memory_match", "level": 1, "score": 85.5, ...}

# Run prediction
POST /predict
Body: {"patient_id": 1001}

# Generate report (doctor)
POST /reports/generate/1001
Header: Authorization: Bearer <token>
```

## 🗄️ Database Quick Access

```bash
# Connect to Neon DB
psql 'postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

# Set schema
SET search_path TO neurocare, public;

# View tables
\dt

# Check users
SELECT id, email, role FROM users;

# Check patients
SELECT * FROM patients;

# Check game assignments
SELECT * FROM game_assignments;

# Check scores
SELECT patient_code, game, level, score FROM game_scores ORDER BY created_at DESC LIMIT 10;
```

## 🎮 Available Games

- `memory_match` - Memory Match
- `attention_maze` - Attention Maze
- `focus_puzzle` - Focus Puzzle
- `pattern_match` - Pattern Match
- `reaction_time` - Reaction Time

## 📊 Database Schema

**Schema:** `neurocare`

**Tables:**
1. `users` - Accounts (doctors & patients)
2. `patients` - Patient profiles
3. `game_scores` - Game performance
4. `predictions` - ML predictions
5. `game_assignments` - Assigned games
6. `medical_documents` - Uploaded docs
7. `patient_reports` - Generated reports

## 🔧 Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Recreate schema
python backend/create_neon_schema.py

# Reset demo data
python scripts/setup_doctor_patient_demo.py

# Start backend (dev mode)
uvicorn backend.main:app --reload

# Start backend (production)
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Check Python path
python -c "import sys; print('\n'.join(sys.path))"
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check backend is running on port 8000 |
| Token invalid | Clear localStorage and re-login |
| Table not found | Run `python backend/create_neon_schema.py` |
| Module not found | Run `pip install -r requirements.txt` |
| CORS error | Check BASE URL in HTML files |
| Schema error | Neon pooler doesn't support search_path in connect_args |

## 📝 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Doctor can login
- [ ] Doctor sees 3 patients
- [ ] Doctor can assign games
- [ ] Patient can login
- [ ] Patient sees assigned games
- [ ] Scores are recorded in DB
- [ ] Doctor can view scores
- [ ] Prediction works
- [ ] Report generation works

## 🔑 Environment Variables

```bash
# Optional - defaults are set in code
export DATABASE_URL="postgresql://..."
export JWT_SECRET="your-secret-key"
```

## 📦 File Structure

```
NeuroCare_AI/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # DB connection
│   ├── models_db.py         # ORM models
│   ├── auth.py              # Authentication
│   ├── create_neon_schema.py # Schema setup
│   └── routes/
│       ├── doctor.py        # Doctor endpoints
│       ├── patient.py       # Patient endpoints
│       └── reports.py       # Report endpoints
├── frontend/
│   ├── doctor_dashboard_v2.html
│   ├── patient_dashboard.html
│   ├── login_doctor.html
│   └── login_patient.html
├── scripts/
│   └── setup_doctor_patient_demo.py
├── requirements.txt
└── README.md
```

## 🎯 Typical Workflow

1. Doctor logs in → Views patients
2. Doctor assigns games → Patient sees them
3. Patient plays games → Scores recorded
4. Doctor views scores → Runs prediction
5. Doctor generates report → Patient reads it

## 💡 Pro Tips

- Use browser DevTools (F12) to debug frontend
- Check uvicorn terminal for backend errors
- Use Neon console for database management
- Test API with curl or Postman
- Clear localStorage if auth issues persist

---

**Quick Help:** Check README.md, NEON_SETUP.md, or API_REFERENCE.md for details

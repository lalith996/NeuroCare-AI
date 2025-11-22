# NeuroCare AI - Quick Start Guide

Get your NeuroCare AI platform running in 5 minutes!

## Prerequisites
- Python 3.8+
- MySQL 5.7+ or MariaDB
- Modern web browser

## Step 1: Database Setup (2 minutes)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS neurocare_ai;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'neuro_user'@'localhost' IDENTIFIED BY 'StrongPassword123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON neurocare_ai.* TO 'neuro_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Create tables
python backend/create_tables_updated.py
```

## Step 2: Install Dependencies (1 minute)

```bash
pip install fastapi uvicorn sqlalchemy pymysql python-jose[cryptography] passlib[bcrypt] python-multipart
```

## Step 3: Setup Demo Data (30 seconds)

```bash
python scripts/setup_doctor_patient_demo.py
```

This creates:
- 1 Doctor account
- 3 Patient accounts
- Pre-assigned relationships

## Step 4: Start Backend (30 seconds)

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## Step 5: Test the System (1 minute)

### Test Doctor Flow

1. Open `frontend/doctor_dashboard_v2.html` in your browser
2. Login with:
   - Email: `doctor@demo.com`
   - Password: `doctor123`
3. Click "Refresh Patients" - you should see 3 patients
4. Click "View Details" on any patient
5. Select games and click "Assign Selected Games"
6. Success! ✓

### Test Patient Flow

1. Open `frontend/patient_dashboard.html` in your browser
2. Login with:
   - Email: `patient1@demo.com`
   - Password: `patient123`
3. You should see assigned games (if doctor assigned them)
4. Click on a game to play
5. Upload a test document (optional)

## Quick Test Checklist

- [ ] Backend server running on port 8000
- [ ] Doctor can login
- [ ] Doctor can see patients
- [ ] Doctor can assign games
- [ ] Patient can login
- [ ] Patient can see assigned games
- [ ] Patient can upload documents
- [ ] Scores are recorded (check database)
- [ ] Doctor can view patient scores
- [ ] Doctor can generate reports

## Verify Database

```bash
mysql -u neuro_user -p neurocare_ai

# Check tables
SHOW TABLES;

# Check users
SELECT id, email, role FROM users;

# Check patients
SELECT * FROM patients;

# Check game assignments
SELECT * FROM game_assignments;
```

## Common Issues

### "Connection refused" error
- Make sure MySQL is running: `sudo systemctl status mysql`
- Check credentials in `backend/database.py`

### "Module not found" error
- Install missing dependencies: `pip install <module_name>`

### "Table doesn't exist" error
- Run: `python backend/create_tables_updated.py`

### Frontend can't connect to backend
- Check backend is running on port 8000
- Check browser console for CORS errors
- Make sure BASE URL in HTML files is correct

### Token/Auth errors
- Clear browser localStorage: `localStorage.clear()` in console
- Re-login

## Next Steps

Once everything is working:

1. **Add Real Game Scores**
   - Play the cognitive games
   - Scores will be automatically recorded

2. **Run Predictions**
   - In doctor dashboard, enter PatientID from training data
   - Click "Run Prediction"
   - View risk assessment

3. **Generate Reports**
   - Click "Generate Report" in doctor dashboard
   - View patient-friendly report
   - Patient can view it in their dashboard

4. **Customize**
   - Add more games
   - Integrate real GenAI (OpenAI/Anthropic)
   - Add email notifications
   - Deploy to production

## Production Deployment

For production use:

1. **Security**
   ```bash
   # Set environment variables
   export JWT_SECRET="your-super-secret-key-here"
   export DATABASE_URL="mysql+pymysql://user:pass@host/db"
   ```

2. **HTTPS**
   - Use nginx or Apache as reverse proxy
   - Get SSL certificate (Let's Encrypt)

3. **CORS**
   - Update `allow_origins` in `backend/main.py`
   - Restrict to your domain only

4. **Database**
   - Use production MySQL server
   - Enable SSL connections
   - Regular backups

5. **Monitoring**
   - Add logging
   - Set up error tracking (Sentry)
   - Monitor server resources

## Support

If you encounter issues:

1. Check the logs:
   - Backend: Terminal where uvicorn is running
   - Frontend: Browser console (F12)
   - Database: MySQL error logs

2. Verify setup:
   - Database connection
   - All tables created
   - Demo data loaded

3. Test API directly:
   ```bash
   # Test login
   curl -X POST http://127.0.0.1:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"doctor@demo.com","password":"doctor123"}'
   ```

## Demo Credentials

### Doctor
- Email: `doctor@demo.com`
- Password: `doctor123`

### Patients
- Email: `patient1@demo.com` | Password: `patient123` | Code: 1001
- Email: `patient2@demo.com` | Password: `patient123` | Code: 1002
- Email: `patient3@demo.com` | Password: `patient123` | Code: 1003

---

**You're all set! 🎉**

Your NeuroCare AI platform is now running. Start by logging in as a doctor and assigning games to patients.

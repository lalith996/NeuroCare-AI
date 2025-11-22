# NeuroCare AI - Complete Setup Guide

## Overview
NeuroCare AI is a cognitive assessment platform that connects doctors and patients for Alzheimer's and MCI screening through gamified cognitive tests.

## System Architecture

### Core Flow
1. **Doctor Portal**: Doctors manage patients, assign games, view scores, and generate reports
2. **Patient Portal**: Patients play assigned cognitive games and upload medical documents
3. **ML Pipeline**: Analyzes game performance to predict cognitive health risks
4. **Report Generation**: AI-generated patient-friendly reports for doctors to review

## Setup Instructions

### 1. Database Setup

First, create the MySQL database and tables:

```bash
# Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS neurocare_ai;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'neuro_user'@'localhost' IDENTIFIED BY 'StrongPassword123';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON neurocare_ai.* TO 'neuro_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Create/update all tables
python backend/create_tables_updated.py
```

### 2. Setup Demo Data

Create demo doctor and patient accounts:

```bash
python scripts/setup_doctor_patient_demo.py
```

This creates:
- **Doctor**: doctor@demo.com / doctor123
- **Patients**: 
  - patient1@demo.com / patient123 (Patient Code: 1001)
  - patient2@demo.com / patient123 (Patient Code: 1002)
  - patient3@demo.com / patient123 (Patient Code: 1003)

### 3. Start Backend Server

```bash
# Install dependencies (if not already)
pip install fastapi uvicorn sqlalchemy pymysql python-jose[cryptography] passlib[bcrypt] python-multipart

# Start server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access Frontend

Open in browser:
- **Doctor Dashboard**: `frontend/doctor_dashboard_v2.html`
- **Patient Dashboard**: `frontend/patient_dashboard.html`
- **Doctor Login**: `frontend/login_doctor.html`
- **Patient Login**: `frontend/login_patient.html`

## Key Features Implemented

### ✅ Doctor Features
1. **Patient Management**
   - View all assigned patients
   - See patient demographics (age, sex, education)
   
2. **Game Assignment**
   - Assign specific cognitive games to patients
   - Track game completion status
   
3. **Score Monitoring**
   - View all patient game scores
   - See aggregated statistics (avg score, max level, attempts)
   
4. **AI Predictions**
   - Run ML predictions on patient data
   - View risk labels and probabilities
   
5. **Report Generation**
   - Generate patient-friendly reports with GenAI
   - Include scores, predictions, and recommendations
   - Copy/share reports with patients

### ✅ Patient Features
1. **Assigned Games View**
   - See only games assigned by their doctor
   - Track completion status
   
2. **Medical Document Upload**
   - Upload previous medical records (optional)
   - Helps improve prediction accuracy
   - Supports: medical history, lab results, imaging
   
3. **Report Access**
   - View latest report from doctor
   - Easy-to-understand language
   - Clear next steps and recommendations

### ✅ Backend API Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login (returns JWT token)

#### Doctor Routes
- `GET /doctor/my-patients` - Get doctor's patients
- `POST /doctor/assign-games` - Assign games to patient
- `GET /doctor/patient/{patient_code}/scores` - Get patient scores

#### Patient Routes
- `GET /patient/my-games` - Get assigned games
- `POST /patient/upload-document` - Upload medical document
- `GET /patient/my-documents` - List uploaded documents

#### Reports
- `POST /reports/generate/{patient_code}` - Generate report (doctor only)
- `GET /reports/patient/{patient_code}/latest` - View latest report

#### Predictions
- `POST /predict` - Run ML prediction (requires PatientID from training data)

#### Scores
- `POST /api/scores` - Submit game score

## Database Schema

### New Tables Added

1. **game_assignments**
   - Links patients to assigned games
   - Tracks assignment status (assigned/in_progress/completed)

2. **medical_documents**
   - Stores uploaded patient documents
   - Tracks document type and upload date

3. **patient_reports**
   - Stores generated reports
   - Links to doctor and patient
   - Includes prediction summary

## Workflow Example

### Complete Doctor-Patient Flow

1. **Doctor assigns patient**
   ```
   Patient 1001 is assigned to Dr. Johnson
   ```

2. **Doctor assigns games**
   ```
   Dr. Johnson assigns: Memory Match, Attention Maze, Focus Puzzle
   ```

3. **Patient plays games**
   ```
   Patient logs in → sees only assigned games → plays over 2-3 weeks
   Scores automatically recorded to database
   ```

4. **Patient uploads documents (optional)**
   ```
   Uploads previous MRI scan, lab results
   ```

5. **Doctor reviews scores**
   ```
   Views aggregated scores, completion rates
   ```

6. **Doctor runs prediction**
   ```
   Enters PatientID from training data
   ML model returns risk assessment
   ```

7. **Doctor generates report**
   ```
   System creates patient-friendly report with:
   - Game performance summary
   - Risk assessment
   - Recommendations
   - Next steps
   ```

8. **Patient views report**
   ```
   Patient logs in → views report in simple language
   Understands results and next steps
   ```

## GenAI Report Generation

Currently uses a template-based approach. To integrate real GenAI:

### Option 1: OpenAI Integration
```python
import openai

def generate_patient_friendly_report(patient_code, scores, prediction):
    prompt = f"""
    Generate a patient-friendly cognitive assessment report.
    
    Patient: {patient_code}
    Scores: {json.dumps(scores)}
    Prediction: {prediction}
    
    Include:
    1. Performance summary in simple language
    2. What the results mean
    3. Next steps
    4. Reassurance and support
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
```

### Option 2: Anthropic Claude
```python
import anthropic

def generate_patient_friendly_report(patient_code, scores, prediction):
    client = anthropic.Anthropic(api_key="your-key")
    
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Generate patient-friendly report for: {scores}"
        }]
    )
    
    return message.content[0].text
```

## Next Steps

### Recommended Enhancements

1. **Real GenAI Integration**
   - Add OpenAI/Anthropic API keys
   - Implement in `backend/routes/reports.py`

2. **Email Notifications**
   - Send report to patient email
   - Notify doctor when patient completes games

3. **Advanced Analytics**
   - Trend analysis over time
   - Comparison with population norms

4. **Document OCR**
   - Extract data from uploaded medical documents
   - Auto-populate patient history

5. **Multi-language Support**
   - Translate reports to patient's language

6. **Mobile App**
   - Native iOS/Android apps for games

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u neuro_user -p neurocare_ai
```

### Token/Auth Issues
```bash
# Clear browser localStorage
localStorage.clear()

# Re-login
```

### Missing Tables
```bash
# Recreate all tables
python backend/create_tables_updated.py
```

## Security Notes

⚠️ **For Production:**
1. Change JWT secret key (environment variable)
2. Use HTTPS for all connections
3. Implement rate limiting
4. Add CORS restrictions
5. Encrypt uploaded documents
6. Add audit logging
7. Implement proper password policies
8. Add 2FA for doctor accounts

## Support

For issues or questions, check:
- Database logs: Check MySQL error logs
- Backend logs: Check uvicorn console output
- Frontend: Check browser console (F12)

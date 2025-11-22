# NeuroCare AI - API Reference

Base URL: `http://127.0.0.1:8000`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### POST /auth/signup
Register a new user (doctor or patient)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "patient"  // or "doctor"
}
```

**Response:**
```json
{
  "msg": "user_created",
  "user_id": 123
}
```

### POST /auth/login
Login and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Doctor Endpoints

### GET /doctor/my-patients
Get all patients assigned to the logged-in doctor

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "patients": [
    {
      "patient_code": 1001,
      "id": 1,
      "age": 65,
      "sex": "M",
      "education_years": 12
    }
  ]
}
```

### POST /doctor/assign-games
Assign specific games to a patient

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "patient_code": 1001,
  "games": ["memory_match", "attention_maze", "focus_puzzle"]
}
```

**Response:**
```json
{
  "status": "success",
  "assigned_games": ["memory_match", "attention_maze", "focus_puzzle"]
}
```

### GET /doctor/patient/{patient_code}/scores
Get all scores and latest prediction for a patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "patient_code": 1001,
  "scores": [
    {
      "id": 1,
      "game": "memory_match",
      "level": 3,
      "score": 85.5,
      "session_id": "sess_123",
      "attempt": 1,
      "metrics": {"accuracy": 0.85, "time": 120},
      "created_at": "2024-01-15 10:30:00"
    }
  ],
  "prediction": {
    "risk_label": "Low Risk",
    "risk_probability": 0.15,
    "computed_at": "2024-01-15 11:00:00",
    "model_version": "v1.0"
  }
}
```

---

## Patient Endpoints

### GET /patient/my-games
Get games assigned to the logged-in patient

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "patient_code": 1001,
  "assigned_games": [
    {
      "game_name": "memory_match",
      "status": "assigned",
      "assigned_at": "2024-01-10 09:00:00"
    }
  ]
}
```

### POST /patient/upload-document
Upload a medical document

**Headers:** `Authorization: Bearer <token>`

**Form Data:**
- `file`: File to upload
- `document_type`: Type of document (query parameter)

**Example:**
```bash
curl -X POST "http://127.0.0.1:8000/patient/upload-document?document_type=medical_history" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf"
```

**Response:**
```json
{
  "status": "uploaded",
  "file_name": "document.pdf",
  "document_id": 1
}
```

### GET /patient/my-documents
Get all uploaded documents

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "document_type": "medical_history",
      "file_name": "mri_scan.pdf",
      "uploaded_at": "2024-01-12 14:30:00"
    }
  ]
}
```

---

## Report Endpoints

### POST /reports/generate/{patient_code}
Generate a patient-friendly report (doctor only)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "generated",
  "report_id": 1,
  "report_content": "# Cognitive Assessment Report...\n\n..."
}
```

### GET /reports/patient/{patient_code}/latest
Get the latest report for a patient (accessible by both doctor and patient)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "report_id": 1,
  "report_content": "# Cognitive Assessment Report...\n\n...",
  "generated_at": "2024-01-15 16:00:00"
}
```

---

## Prediction Endpoints

### POST /predict
Run ML prediction on patient data

**Request Body:**
```json
{
  "patient_id": 1001
}
```

**Response:**
```json
{
  "patient_id": 1001,
  "risk_label": "Low Risk",
  "risk_probability": 0.15,
  "all_probs": {
    "Low Risk": 0.85,
    "High Risk": 0.15
  },
  "model_used": "/path/to/model.joblib"
}
```

---

## Score Submission

### POST /api/scores
Submit a game score (called by game frontend)

**Request Body:**
```json
{
  "patient_id": 1001,
  "session_id": "sess_abc123",
  "game": "memory_match",
  "level": 3,
  "score": 85.5,
  "metrics": {
    "accuracy": 0.85,
    "reaction_time_avg": 1.2,
    "errors": 3
  },
  "timestamp_start": "2024-01-15T10:00:00",
  "timestamp_end": "2024-01-15T10:05:00",
  "device": "desktop",
  "attempt": 1
}
```

**Response:**
```json
{
  "status": "saved_db",
  "id": 123
}
```

---

## Admin Endpoints

### POST /admin/assign_patient
Assign a patient to a doctor (admin/doctor only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "doctor_user_id": 5,
  "patient_code": 1001
}
```

**Response:**
```json
{
  "status": "assigned",
  "patient_code": 1001,
  "doctor_id": 5
}
```

### GET /doctor/{doctor_user_id}/patients
Get patients for a specific doctor (admin or that doctor only)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "patients": [
    {
      "patient_code": 1001,
      "id": 1
    }
  ]
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "detail": "Error message here"
}
```

---

## Available Games

Current game identifiers:
- `memory_match` - Memory Match Game
- `attention_maze` - Attention Maze
- `focus_puzzle` - Focus Puzzle
- `pattern_match` - Pattern Match
- `reaction_time` - Reaction Time Test

---

## Document Types

Supported document types for upload:
- `medical_history` - Medical History
- `lab_results` - Laboratory Results
- `imaging` - Imaging Reports (MRI, CT, etc.)
- `other` - Other Medical Documents

---

## Game Assignment Status

- `assigned` - Game assigned but not started
- `in_progress` - Patient has started playing
- `completed` - Patient has completed the game

---

## Testing with cURL

### Login as Doctor
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@demo.com","password":"doctor123"}'
```

### Get My Patients
```bash
curl -X GET http://127.0.0.1:8000/doctor/my-patients \
  -H "Authorization: Bearer <your_token>"
```

### Assign Games
```bash
curl -X POST http://127.0.0.1:8000/doctor/assign-games \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"patient_code":1001,"games":["memory_match","attention_maze"]}'
```

### Generate Report
```bash
curl -X POST http://127.0.0.1:8000/reports/generate/1001 \
  -H "Authorization: Bearer <your_token>"
```

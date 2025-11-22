# backend/routes/doctor.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from backend.database import SessionLocal
from backend.models_db import User, Patient, GameScore, Prediction, GameAssignment
from backend.auth import get_current_user

router = APIRouter(prefix="/doctor", tags=["doctor"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AssignGamePayload(BaseModel):
    patient_code: int
    games: List[str]  # e.g., ["memory_match", "attention_maze"]

class PatientScoresResponse(BaseModel):
    patient_code: int
    scores: List[dict]
    prediction: Optional[dict] = None

@router.get("/my-patients")
def get_my_patients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all patients assigned to the logged-in doctor"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this")
    
    patients = db.query(Patient).filter(Patient.user_id == current_user.id).all()
    return {
        "patients": [
            {
                "patient_code": p.patient_code,
                "id": p.id,
                "age": p.age,
                "sex": p.sex,
                "education_years": p.education_years
            } for p in patients
        ]
    }

@router.post("/assign-games")
def assign_games(
    payload: AssignGamePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Doctor assigns specific games to a patient"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can assign games")
    
    # Verify patient belongs to this doctor
    patient = db.query(Patient).filter(
        Patient.patient_code == payload.patient_code,
        Patient.user_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or not assigned to you")
    
    # Clear existing assignments
    db.query(GameAssignment).filter(GameAssignment.patient_code == payload.patient_code).delete()
    
    # Create new assignments
    for game in payload.games:
        assignment = GameAssignment(
            patient_code=payload.patient_code,
            doctor_id=current_user.id,
            game_name=game,
            status="assigned"
        )
        db.add(assignment)
    
    db.commit()
    return {"status": "success", "assigned_games": payload.games}

@router.get("/patient/{patient_code}/scores")
def get_patient_scores(
    patient_code: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all scores for a specific patient"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view patient scores")
    
    # Verify patient belongs to this doctor
    patient = db.query(Patient).filter(
        Patient.patient_code == patient_code,
        Patient.user_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or not assigned to you")
    
    # Get all scores
    scores = db.query(GameScore).filter(GameScore.patient_code == patient_code).all()
    
    # Get latest prediction
    prediction = db.query(Prediction).filter(
        Prediction.patient_code == patient_code
    ).order_by(Prediction.computed_at.desc()).first()
    
    return {
        "patient_code": patient_code,
        "scores": [
            {
                "id": s.id,
                "game": s.game,
                "level": s.level,
                "score": s.score,
                "session_id": s.session_id,
                "attempt": s.attempt,
                "metrics": s.metrics,
                "created_at": str(s.created_at)
            } for s in scores
        ],
        "prediction": {
            "risk_label": prediction.risk_label,
            "risk_probability": prediction.risk_probability,
            "computed_at": str(prediction.computed_at),
            "model_version": prediction.model_version
        } if prediction else None
    }

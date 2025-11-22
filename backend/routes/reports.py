# backend/routes/reports.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database import SessionLocal
from backend.models_db import User, Patient, GameScore, Prediction, PatientReport
from backend.auth import get_current_user
import os
import json

router = APIRouter(prefix="/reports", tags=["reports"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_patient_friendly_report(patient_code: int, scores: list, prediction: dict) -> str:
    """
    Generate a patient-friendly report using GenAI (placeholder for now)
    In production, integrate with OpenAI/Anthropic/Gemini API
    """
    # Aggregate scores by game
    game_summary = {}
    for score in scores:
        game = score["game"]
        if game not in game_summary:
            game_summary[game] = {"total_attempts": 0, "avg_score": 0, "max_level": 0}
        game_summary[game]["total_attempts"] += 1
        game_summary[game]["avg_score"] += score["score"]
        game_summary[game]["max_level"] = max(game_summary[game]["max_level"], score["level"])
    
    for game in game_summary:
        game_summary[game]["avg_score"] /= game_summary[game]["total_attempts"]
    
    # Generate friendly text (placeholder - replace with actual GenAI call)
    risk_label = prediction.get("risk_label", "Unknown")
    risk_prob = prediction.get("risk_probability", 0)
    
    report_text = f"""
# Cognitive Assessment Report - Patient #{patient_code}

## Summary
Based on your performance across multiple cognitive games over the past weeks, our AI system has analyzed your results.

## Your Performance

"""
    
    for game, stats in game_summary.items():
        report_text += f"""
### {game.replace('_', ' ').title()}
- Games Played: {stats['total_attempts']}
- Average Score: {stats['avg_score']:.1f}
- Highest Level Reached: {stats['max_level']}

"""
    
    report_text += f"""
## Assessment Result

**Risk Level:** {risk_label}
**Confidence:** {risk_prob * 100:.1f}%

"""
    
    if risk_label.lower() in ["high", "alzheimer", "mci"]:
        report_text += """
### What This Means
Your cognitive assessment shows patterns that may require further medical evaluation. This does NOT mean you have a definitive diagnosis - it's a screening tool to help your doctor decide if additional tests are needed.

### Next Steps
1. Schedule a follow-up appointment with your doctor
2. Discuss these results in detail
3. Your doctor may recommend additional clinical assessments
4. Continue monitoring your cognitive health

### Important Note
This is a screening tool, not a diagnosis. Only your doctor can make a final medical determination.
"""
    else:
        report_text += """
### What This Means
Your cognitive assessment shows healthy performance patterns. Continue maintaining your cognitive health through regular mental exercises and healthy lifestyle choices.

### Recommendations
1. Continue playing cognitive games regularly
2. Maintain a healthy lifestyle (exercise, diet, sleep)
3. Stay socially engaged
4. Schedule regular check-ups with your doctor

"""
    
    return report_text

@router.post("/generate/{patient_code}")
def generate_report(
    patient_code: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Doctor generates a patient-friendly report"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can generate reports")
    
    # Verify patient belongs to this doctor
    patient = db.query(Patient).filter(
        Patient.patient_code == patient_code,
        Patient.user_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or not assigned to you")
    
    # Get scores and prediction
    scores = db.query(GameScore).filter(GameScore.patient_code == patient_code).all()
    prediction = db.query(Prediction).filter(
        Prediction.patient_code == patient_code
    ).order_by(Prediction.computed_at.desc()).first()
    
    if not scores:
        raise HTTPException(status_code=400, detail="No scores available for this patient")
    
    scores_data = [
        {
            "game": s.game,
            "level": s.level,
            "score": s.score,
            "created_at": str(s.created_at)
        } for s in scores
    ]
    
    prediction_data = {
        "risk_label": prediction.risk_label,
        "risk_probability": prediction.risk_probability
    } if prediction else {"risk_label": "Not yet computed", "risk_probability": 0}
    
    # Generate report
    report_content = generate_patient_friendly_report(patient_code, scores_data, prediction_data)
    
    # Save report
    report = PatientReport(
        patient_code=patient_code,
        doctor_id=current_user.id,
        report_content=report_content,
        prediction_summary=json.dumps(prediction_data)
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return {
        "status": "generated",
        "report_id": report.id,
        "report_content": report_content
    }

@router.get("/patient/{patient_code}/latest")
def get_latest_report(
    patient_code: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the latest report for a patient (accessible by both doctor and patient)"""
    # Verify access
    if current_user.role == "patient":
        patient = db.query(Patient).filter(
            Patient.patient_code == patient_code,
            Patient.user_id == current_user.id
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "doctor":
        patient = db.query(Patient).filter(
            Patient.patient_code == patient_code,
            Patient.user_id == current_user.id
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Patient not assigned to you")
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    report = db.query(PatientReport).filter(
        PatientReport.patient_code == patient_code
    ).order_by(PatientReport.generated_at.desc()).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="No report found")
    
    return {
        "report_id": report.id,
        "report_content": report.report_content,
        "generated_at": str(report.generated_at)
    }

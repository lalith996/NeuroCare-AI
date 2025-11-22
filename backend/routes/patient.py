# backend/routes/patient.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from backend.database import SessionLocal
from backend.models_db import User, Patient, GameAssignment, MedicalDocument
from backend.auth import get_current_user
import os
from pathlib import Path

router = APIRouter(prefix="/patient", tags=["patient"])

UPLOAD_DIR = Path("uploads/medical_docs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/my-games")
def get_assigned_games(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get games assigned to the logged-in patient"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access this")
    
    # Get patient record
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Get assigned games
    assignments = db.query(GameAssignment).filter(
        GameAssignment.patient_code == patient.patient_code
    ).all()
    
    return {
        "patient_code": patient.patient_code,
        "assigned_games": [
            {
                "game_name": a.game_name,
                "status": a.status,
                "assigned_at": str(a.assigned_at)
            } for a in assignments
        ]
    }

@router.post("/upload-document")
async def upload_medical_document(
    file: UploadFile = File(...),
    document_type: str = "medical_history",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload medical documents (optional but helpful for predictions)"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can upload documents")
    
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Save file
    file_path = UPLOAD_DIR / f"{patient.patient_code}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Record in database
    doc = MedicalDocument(
        patient_code=patient.patient_code,
        document_type=document_type,
        file_path=str(file_path),
        file_name=file.filename
    )
    db.add(doc)
    db.commit()
    
    return {
        "status": "uploaded",
        "file_name": file.filename,
        "document_id": doc.id
    }

@router.get("/my-documents")
def get_my_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all uploaded medical documents"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access this")
    
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    docs = db.query(MedicalDocument).filter(
        MedicalDocument.patient_code == patient.patient_code
    ).all()
    
    return {
        "documents": [
            {
                "id": d.id,
                "document_type": d.document_type,
                "file_name": d.file_name,
                "uploaded_at": str(d.uploaded_at)
            } for d in docs
        ]
    }

# backend/models_db.py
from sqlalchemy import Column, Integer, String, Float, JSON, Text
from sqlalchemy import ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP

# This is the Base that create_tables.py imports
Base = declarative_base()

# -------------------------
# DB models / ORM mappings
# -------------------------

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="patient")  # patient/doctor/admin
    created_at = Column(TIMESTAMP, server_default=func.now())

class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, unique=True, nullable=False)  # maps to PatientID
    user_id = Column(Integer, ForeignKey("neurocare.users.id"), nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)
    education_years = Column(Integer, nullable=True)

class GameScore(Base):
    __tablename__ = "game_scores"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, index=True, nullable=False)
    session_id = Column(String(255), nullable=True)
    game = Column(String(100), nullable=False)
    level = Column(Integer)
    attempt = Column(Integer, default=1)
    score = Column(Float)
    metrics = Column(JSON)     # raw metrics JSON
    timestamp_start = Column(String(100))
    timestamp_end = Column(String(100))
    device = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, index=True, nullable=False)
    model_version = Column(String(100))
    computed_at = Column(TIMESTAMP, server_default=func.now())
    risk_probability = Column(Float)
    risk_label = Column(String(50))
    feature_importance = Column(JSON)
    input_summary = Column(JSON)

class GameAssignment(Base):
    __tablename__ = "game_assignments"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, index=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("neurocare.users.id"), nullable=False)
    game_name = Column(String(100), nullable=False)
    status = Column(String(50), default="assigned")  # assigned, in_progress, completed
    assigned_at = Column(TIMESTAMP, server_default=func.now())

class MedicalDocument(Base):
    __tablename__ = "medical_documents"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, index=True, nullable=False)
    document_type = Column(String(100))  # medical_history, lab_results, etc.
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255))
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

class PatientReport(Base):
    __tablename__ = "patient_reports"
    __table_args__ = {"schema": "neurocare"}
    
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(Integer, index=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("neurocare.users.id"), nullable=False)
    report_content = Column(Text)  # Store report text (PostgreSQL TEXT type)
    prediction_summary = Column(JSON)
    generated_at = Column(TIMESTAMP, server_default=func.now())

#!/usr/bin/env python3
"""
Setup demo doctor-patient relationships for testing
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import SessionLocal
from backend.models_db import User, Patient
from backend.auth import get_password_hash

def setup_demo():
    db = SessionLocal()
    
    try:
        print("Setting up demo doctor-patient relationships...")
        
        # Create a demo doctor
        doctor = db.query(User).filter(User.email == "doctor@demo.com").first()
        if not doctor:
            doctor = User(
                email="doctor@demo.com",
                password_hash=get_password_hash("doctor123"),
                full_name="Dr. Sarah Johnson",
                role="doctor"
            )
            db.add(doctor)
            db.commit()
            db.refresh(doctor)
            print(f"✓ Created doctor: {doctor.email} (ID: {doctor.id})")
        else:
            print(f"✓ Doctor already exists: {doctor.email} (ID: {doctor.id})")
        
        # Create demo patients
        demo_patients = [
            {"email": "patient1@demo.com", "password": "patient123", "name": "John Doe", "code": 1001, "age": 65, "sex": "M"},
            {"email": "patient2@demo.com", "password": "patient123", "name": "Jane Smith", "code": 1002, "age": 72, "sex": "F"},
            {"email": "patient3@demo.com", "password": "patient123", "name": "Bob Wilson", "code": 1003, "age": 68, "sex": "M"},
        ]
        
        for p_data in demo_patients:
            # Create user account
            user = db.query(User).filter(User.email == p_data["email"]).first()
            if not user:
                user = User(
                    email=p_data["email"],
                    password_hash=get_password_hash(p_data["password"]),
                    full_name=p_data["name"],
                    role="patient"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"✓ Created patient user: {user.email} (ID: {user.id})")
            else:
                print(f"✓ Patient user already exists: {user.email} (ID: {user.id})")
            
            # Create/update patient record
            patient = db.query(Patient).filter(Patient.patient_code == p_data["code"]).first()
            if not patient:
                patient = Patient(
                    patient_code=p_data["code"],
                    user_id=user.id,
                    age=p_data["age"],
                    sex=p_data["sex"],
                    education_years=12
                )
                db.add(patient)
            else:
                patient.user_id = user.id
                patient.age = p_data["age"]
                patient.sex = p_data["sex"]
            
            db.commit()
            print(f"✓ Patient {p_data['code']} assigned to user {user.id}")
        
        # Assign all patients to the doctor
        patients = db.query(Patient).filter(Patient.patient_code.in_([1001, 1002, 1003])).all()
        for patient in patients:
            patient.user_id = doctor.id
            db.add(patient)
        
        db.commit()
        print(f"\n✓ All demo patients assigned to Dr. {doctor.full_name}")
        
        print("\n" + "="*60)
        print("DEMO CREDENTIALS")
        print("="*60)
        print("\nDoctor Login:")
        print("  Email: doctor@demo.com")
        print("  Password: doctor123")
        print("\nPatient Logins:")
        for p in demo_patients:
            print(f"  Email: {p['email']}")
            print(f"  Password: {p['password']}")
            print(f"  Patient Code: {p['code']}")
            print()
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    setup_demo()

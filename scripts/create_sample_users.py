# scripts/create_sample_users.py
from backend.database import SessionLocal
from backend.models_db import User, Patient
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def add_user(session, email, password, full_name, role):
    u = session.query(User).filter(User.email==email).first()
    if u:
        return u
    u = User(email=email, password_hash=pwd.hash(password), full_name=full_name, role=role)
    session.add(u)
    session.commit()
    session.refresh(u)
    return u

def main():
    s = SessionLocal()
    # Doctors
    d1 = add_user(s, "dr.arya@example.com", "drpassword", "Dr Arya", "doctor")
    d2 = add_user(s, "dr.rao@example.com", "drpassword", "Dr Rao", "doctor")
    # Patients (create as users + patient_code mapping)
    p1 = add_user(s, "pat.alice@example.com", "patpassword", "Alice", "patient")
    p2 = add_user(s, "pat.bob@example.com", "patpassword", "Bob", "patient")
    # create patient rows mapping to example patient_code values (choose codes that exist in your training_table)
    # Pick some PatientID values from ml/training_table.csv and set them here:
    patient_codes = [1, 2]  # CHANGE these to real PatientID values from your CSV
    for i, code in enumerate(patient_codes):
        existing = s.query(Patient).filter(Patient.patient_code==code).first()
        if existing:
            existing.user_id = p1.id if i==0 else p2.id
        else:
            newp = Patient(patient_code=code, user_id=(d1.id if i==0 else d2.id))
            s.add(newp)
    s.commit()
    print("Sample users created. Doctors:", d1.email, d2.email)

if __name__ == "__main__":
    main()

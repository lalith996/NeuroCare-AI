# scripts/load_csv_to_db.py
"""
Load CSVs into DB tables:
 - alzheimers_disease_data.csv -> patients (Patient mapping)
 - patient_game_scores.csv -> game_scores
This script uses the SQLAlchemy models in backend/models_db.py and backend.database.SessionLocal
"""

import pandas as pd
from pathlib import Path
from backend.database import SessionLocal
from backend.models_db import Patient, GameScore
from sqlalchemy.orm import Session
import json

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
BASE_CSV = DATA_DIR / "alzheimers_disease_data.csv"
GAME_CSV = DATA_DIR / "patient_game_scores.csv"

def load_patients():
    df = pd.read_csv(BASE_CSV)
    session: Session = SessionLocal()
    try:
        for _, r in df.iterrows():
            pid = int(r["PatientID"])
            existing = session.query(Patient).filter_by(patient_code=pid).first()
            if existing:
                continue
            p = Patient(
                patient_code=pid,
                age=int(r["Age"]) if not pd.isna(r.get("Age")) else None,
                sex=r.get("Gender"),
                education_years=int(r.get("EducationLevel")) if not pd.isna(r.get("EducationLevel")) else None
            )
            session.add(p)
        session.commit()
        print("✅ Patients loaded.")
    except Exception as e:
        session.rollback()
        print("Error loading patients:", e)
    finally:
        session.close()

def load_game_scores(batch=1000):
    df = pd.read_csv(GAME_CSV)
    session: Session = SessionLocal()
    try:
        rows = []
        for i, r in df.iterrows():
            # attempt to parse metrics JSON if present
            metrics = None
            if 'metrics_json' in r and not pd.isna(r['metrics_json']):
                try:
                    metrics = json.loads(r['metrics_json'])
                except Exception:
                    metrics = None
            gs = GameScore(
                patient_code=int(r["PatientID"]),
                session_id = r.get("session_id") if 'session_id' in r else None,
                game = r.get("Game"),
                level = int(r["Level"]) if not pd.isna(r.get("Level")) else None,
                attempt = int(r["attempt"]) if 'attempt' in r and not pd.isna(r.get('attempt')) else 1,
                score = float(r["Score"]) if not pd.isna(r.get("Score")) else None,
                metrics = metrics,
                timestamp_start = r.get("timestamp_start") if 'timestamp_start' in r else None,
                timestamp_end = r.get("timestamp_end") if 'timestamp_end' in r else None,
                device = r.get("device") if 'device' in r else None
            )
            session.add(gs)
            if (i+1) % batch == 0:
                session.commit()
                print(f"Committed {i+1} rows...")
        session.commit()
        print("✅ Game scores loaded.")
    except Exception as e:
        session.rollback()
        print("Error loading game_scores:", e)
    finally:
        session.close()

if __name__ == "__main__":
    print("Starting CSV -> DB import")
    load_patients()
    load_game_scores()
    print("Import finished")

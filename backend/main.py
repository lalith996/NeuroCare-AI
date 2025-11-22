# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from pathlib import Path
import pandas as pd
import joblib
import json
import os
from typing import Optional, Dict, Any, List, Tuple

from backend.database import SessionLocal
from backend.models_db import GameScore, Patient, User
from sqlalchemy.orm import Session

# include auth router (signup/login)
from backend.auth import router as auth_router
from backend.routes.doctor import router as doctor_router
from backend.routes.patient import router as patient_router
from backend.routes.reports import router as reports_router

ROOT = Path(__file__).resolve().parent.parent

# ---------- Paths / config ----------
TRAIN_PATH = ROOT / "ml" / "training_table.csv"

# Model/artifact search locations (preferred order)
ML_MODELS_DIR = ROOT / "ml" / "models"
PIPELINE_PRIMARY = ML_MODELS_DIR / "pipeline.joblib"
PIPELINE_ALT = ML_MODELS_DIR / "pipeline.pkl"
PIPELINE_UPLOAD_FALLBACK = Path("/mnt/data/pipeline.joblib")   # path used by Colab/uploaded artifacts
MODEL_CANDIDATES = [
    ML_MODELS_DIR / "neurocare_rf_model.joblib",
    ML_MODELS_DIR / "rf_baseline.joblib",
]
FEATURES_PATH = ML_MODELS_DIR / "model_features.csv"
MODEL_INFO_PATH = ML_MODELS_DIR / "model_info.json"
# Also allow reading model_features from /mnt/data if uploaded there
FEATURES_FALLBACK = Path("/mnt/data/model_features.csv")

# App
app = FastAPI(
    title="NeuroCare AI API",
    description="Cognitive Assessment Platform for Alzheimer's and MCI Screening",
    version="1.0.0"
)

# CORS - Update for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict for production to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for deployment platforms
@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "NeuroCare AI API",
        "version": "1.0.0",
        "database": "connected" if model_obj else "model_not_loaded"
    }

@app.get("/health", tags=["health"])
def health():
    """Alternative health check endpoint"""
    return {"status": "ok"}

# include auth routes (signup/login)
app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(patient_router)
app.include_router(reports_router)

# ---------- Model loader (supports pipeline or raw model + feature list) ----------
_model_obj = None
_model_features: Optional[List[str]] = None
_model_is_pipeline: Optional[bool] = None
_model_path_used: Optional[Path] = None


def _find_and_load_model() -> Tuple[object, Optional[List[str]], bool, Optional[Path]]:
    """
    Returns (model_or_pipeline, feature_list_or_None, is_pipeline_flag, path_used)
    Search order:
      1) pipeline.joblib in ml/models
      2) pipeline.pkl in ml/models
      3) /mnt/data/pipeline.joblib (uploaded colab artifact)
      4) raw model candidates in ml/models + model_features.csv
    """
    # 1) pipeline in project
    if PIPELINE_PRIMARY.exists():
        m = joblib.load(PIPELINE_PRIMARY)
        feats = None
        if FEATURES_PATH.exists():
            try:
                feats = pd.read_csv(FEATURES_PATH, header=None).iloc[:, 0].astype(str).tolist()
            except Exception:
                feats = None
        return m, feats, True, PIPELINE_PRIMARY

    # 2) alternative pipeline name
    if PIPELINE_ALT.exists():
        m = joblib.load(PIPELINE_ALT)
        feats = None
        if FEATURES_PATH.exists():
            try:
                feats = pd.read_csv(FEATURES_PATH, header=None).iloc[:, 0].astype(str).tolist()
            except Exception:
                feats = None
        return m, feats, True, PIPELINE_ALT

    # 3) colab/uploaded fallback pipeline
    if PIPELINE_UPLOAD_FALLBACK.exists():
        try:
            m = joblib.load(PIPELINE_UPLOAD_FALLBACK)
            feats = None
            # fallback feature list location
            if FEATURES_PATH.exists():
                try:
                    feats = pd.read_csv(FEATURES_PATH, header=None).iloc[:, 0].astype(str).tolist()
                except Exception:
                    feats = None
            elif FEATURES_FALLBACK.exists():
                try:
                    feats = pd.read_csv(FEATURES_FALLBACK, header=None).iloc[:, 0].astype(str).tolist()
                except Exception:
                    feats = None
            return m, feats, True, PIPELINE_UPLOAD_FALLBACK
        except Exception:
            # continue to raw model candidate search
            pass

    # 4) raw model candidates + feature list
    for p in MODEL_CANDIDATES:
        if p.exists():
            m = joblib.load(p)
            feats = None
            # try project features path then fallback to /mnt/data
            if FEATURES_PATH.exists():
                try:
                    feats = pd.read_csv(FEATURES_PATH, header=None).iloc[:, 0].astype(str).tolist()
                except Exception:
                    feats = None
            elif FEATURES_FALLBACK.exists():
                try:
                    feats = pd.read_csv(FEATURES_FALLBACK, header=None).iloc[:, 0].astype(str).tolist()
                except Exception:
                    feats = None
            return m, feats, False, p

    raise FileNotFoundError(
        "No pipeline or model found. Checked: "
        f"{PIPELINE_PRIMARY}, {PIPELINE_ALT}, {PIPELINE_UPLOAD_FALLBACK}, and {MODEL_CANDIDATES}"
    )


def load_model_and_features():
    """Lazy loader wrapper."""
    global _model_obj, _model_features, _model_is_pipeline, _model_path_used
    if _model_obj is not None:
        return _model_obj, _model_features, _model_is_pipeline
    m, feats, is_pipeline, path_used = _find_and_load_model()
    _model_obj = m
    _model_features = feats
    _model_is_pipeline = is_pipeline
    _model_path_used = path_used
    return _model_obj, _model_features, _model_is_pipeline


# Try pre-load for faster failures
try:
    model_obj, model_features, model_is_pipeline = load_model_and_features()
    print("Loaded model/pipeline from:", _model_path_used)
    if model_features:
        print("Loaded feature list (len):", len(model_features))
    print("Model is pipeline?:", bool(model_is_pipeline))
except Exception as e:
    model_obj = None
    model_features = None
    model_is_pipeline = None
    print("Warning: model/pipeline not preloaded:", e)

# load training csv if present (used as demo patient store)
train_df = None
if TRAIN_PATH.exists():
    try:
        train_df = pd.read_csv(TRAIN_PATH)
        print(f"Loaded training table rows: {len(train_df)}")
    except Exception as e:
        print("Warning: failed to load training table:", e)
else:
    print("Warning: training table not found at:", TRAIN_PATH)


# ---------- Auth helpers ----------
SECRET_KEY = os.getenv("JWT_SECRET", "supersecret_dev_key_change_in_prod")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def decode_token(token: str):
    from jose import jwt, JWTError

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Decode bearer token and return ORM User instance.
    Raises 401 if invalid or user not found.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload (no sub)")
    try:
        uid = int(sub)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user id in token")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=401, detail="User from token not found")
    return user


# ---------- Request/response models ----------
class AssignPayload(BaseModel):
    doctor_user_id: int
    patient_code: int


class ScorePayload(BaseModel):
    patient_id: int
    session_id: str
    game: str
    level: int
    score: float
    metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp_start: Optional[str] = None
    timestamp_end: Optional[str] = None
    device: Optional[str] = None
    attempt: Optional[int] = 1


class PredictRequest(BaseModel):
    patient_id: int


# ---------- Endpoints ----------
@app.post("/admin/assign_patient")
def assign_patient(payload: AssignPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Assign an existing patient (patient_code) to a doctor user id.
    Only doctors or admin may call.
    """
    if current_user.role not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # find or create patient row
    p = db.query(Patient).filter(Patient.patient_code == payload.patient_code).first()
    if not p:
        p = Patient(patient_code=payload.patient_code, user_id=None)
        db.add(p)
        db.commit()
        db.refresh(p)

    doctor = db.query(User).filter(User.id == payload.doctor_user_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor user not found")

    p.user_id = doctor.id
    db.add(p)
    db.commit()
    return {"status": "assigned", "patient_code": p.patient_code, "doctor_id": doctor.id}


@app.get("/doctor/{doctor_user_id}/patients")
def doctor_patients(doctor_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Return patients assigned to the given doctor_user_id.
    Only that doctor or admin can call.
    """
    if current_user.role not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Not allowed")

    if current_user.role == "doctor" and int(current_user.id) != doctor_user_id:
        raise HTTPException(status_code=403, detail="Cannot access other doctor's patients")

    rows = db.query(Patient).filter(Patient.user_id == doctor_user_id).all()
    out = [{"patient_code": r.patient_code, "id": r.id} for r in rows]
    return {"patients": out}


@app.post("/api/scores")
def receive_score_db(payload: ScorePayload, db: Session = Depends(get_db)):
    if not payload.patient_id or not payload.session_id:
        raise HTTPException(status_code=400, detail="patient_id and session_id required")

    try:
        gs = GameScore(
            patient_code=int(payload.patient_id),
            session_id=payload.session_id,
            game=payload.game,
            level=int(payload.level),
            attempt=int(payload.attempt or 1),
            score=float(payload.score),
            metrics=payload.metrics,
            timestamp_start=payload.timestamp_start,
            timestamp_end=payload.timestamp_end,
            device=payload.device,
        )
        db.add(gs)
        db.commit()
        db.refresh(gs)
        return {"status": "saved_db", "id": gs.id}
    except Exception as e:
        # fallback to CSV append
        DATA_CSV = ROOT / "data" / "patient_game_scores.csv"
        try:
            DATA_CSV.parent.mkdir(parents=True, exist_ok=True)
            row = {
                "PatientID": payload.patient_id,
                "Week": None,
                "Game": payload.game,
                "Level": payload.level,
                "Score": payload.score,
                "DurationSec": None,
                "Diagnosis": None,
                "session_id": payload.session_id,
                "attempt": payload.attempt,
                "metrics_json": json.dumps(payload.metrics),
                "timestamp_start": payload.timestamp_start,
                "timestamp_end": payload.timestamp_end,
                "device": payload.device,
            }
            pd.DataFrame([row]).to_csv(DATA_CSV, mode="a", header=not DATA_CSV.exists(), index=False)
            return {"status": "saved_csv"}
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Failed saving score to DB and CSV: {e}; csv_err={e2}")


# ---------- Predict endpoint using pipeline if available ----------
@app.post("/predict")
def predict(req: PredictRequest):
    pid = req.patient_id

    # Load model/pipeline + features
    try:
        model_obj, feature_names, is_pipeline = load_model_and_features()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model load error: {e}")

    # Load training table (or fail)
    if train_df is None:
        if TRAIN_PATH.exists():
            try:
                local_train = pd.read_csv(TRAIN_PATH)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed reading training_table.csv: {e}")
        else:
            raise HTTPException(status_code=500, detail=f"Training table not available at {TRAIN_PATH}")
    else:
        local_train = train_df

    # find patient
    row = local_train[local_train["PatientID"] == pid]
    if row.empty:
        raise HTTPException(status_code=404, detail=f"Patient {pid} not found in training table")

    # Pipeline flow: pass raw features (pipeline will preprocess)
    if is_pipeline:
        # Prepare raw DataFrame for pipeline — drop admin/target cols commonly present
        raw = row.copy()
        for drop in ("PatientID", "patient_id", "DoctorInCharge", "risk_label", "Diagnosis", "Diagnosis_x", "Diagnosis_y"):
            if drop in raw.columns:
                try:
                    raw = raw.drop(columns=[drop])
                except Exception:
                    pass
        # Reset index and fillna
        X_row = raw.reset_index(drop=True).fillna(0)
        try:
            if hasattr(model_obj, "predict_proba"):
                probs = model_obj.predict_proba(X_row)[0]
                classes = list(model_obj.classes_)
                pred_label = model_obj.predict(X_row)[0]
                prob_map = {str(classes[i]): float(probs[i]) for i in range(len(classes))}
                prob_for_pred = float(prob_map.get(str(pred_label), max(probs)))
            else:
                pred_label = model_obj.predict(X_row)[0]
                prob_map = {str(pred_label): 1.0}
                prob_for_pred = 1.0
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pipeline prediction error: {e}")

    else:
        # Raw model + feature list flow: build aligned feature vector
        if not feature_names:
            raise HTTPException(status_code=500, detail="Model expects a feature list but none was found.")
        X_row = pd.DataFrame(index=[0], columns=feature_names)
        for f in feature_names:
            if f in row.columns:
                X_row.at[0, f] = row.iloc[0][f]
                continue
            if "_" in f:
                base, val = f.rsplit("_", 1)
                if base in row.columns:
                    try:
                        X_row.at[0, f] = 1 if str(row.iloc[0][base]) == str(val) else 0
                    except Exception:
                        X_row.at[0, f] = 0
                else:
                    X_row.at[0, f] = 0
            else:
                X_row.at[0, f] = 0
        # coerce numbers
        X_row = X_row.fillna(0)
        for c in X_row.columns:
            X_row[c] = pd.to_numeric(X_row[c], errors="coerce").fillna(0.0)
        try:
            if hasattr(model_obj, "predict_proba"):
                probs = model_obj.predict_proba(X_row)[0]
                classes = list(model_obj.classes_)
                pred_label = model_obj.predict(X_row)[0]
                prob_map = {str(classes[i]): float(probs[i]) for i in range(len(classes))}
                prob_for_pred = float(prob_map.get(str(pred_label), max(probs)))
            else:
                pred_label = model_obj.predict(X_row)[0]
                prob_map = {str(pred_label): 1.0}
                prob_for_pred = 1.0
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    return {
        "patient_id": pid,
        "risk_label": str(pred_label),
        "risk_probability": round(prob_for_pred, 4),
        "all_probs": prob_map,
        "model_used": str(_model_path_used) if _model_path_used else None,
    }


@app.get("/some-protected")
def protected(cur_user: User = Depends(get_current_user)):
    """
    Example protected endpoint showing current user info (ORM User returned).
    """
    return {"email": cur_user.email, "role": cur_user.role, "id": cur_user.id}

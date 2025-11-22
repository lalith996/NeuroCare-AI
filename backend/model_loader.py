# backend/model_loader.py
from pathlib import Path
import joblib
import pandas as pd
from typing import Tuple, List, Optional

ROOT = Path(__file__).resolve().parent.parent
ML_MODELS_DIR = ROOT / "ml" / "models"

# Preferred artifact names
PIPELINE_FILE = ML_MODELS_DIR / "pipeline.joblib"
PIPELINE_ALT = ML_MODELS_DIR / "pipeline.pkl"
MODEL_FILE_CANDIDATES = [
    ML_MODELS_DIR / "neurocare_rf_model.joblib",
    ML_MODELS_DIR / "rf_baseline.joblib",
]
FEATURES_FILE = ML_MODELS_DIR / "model_features.csv"
MODEL_INFO = ML_MODELS_DIR / "model_info.json"

def load_model_and_features() -> Tuple[object, Optional[List[str]], bool]:
    """
    Returns: (model_or_pipeline, feature_list_or_None, is_pipeline_flag)
    - If a pipeline artifact exists (pipeline.joblib), it is loaded and returned with is_pipeline=True.
      feature_list may still be returned (if present) but pipeline handles preprocessing.
    - Otherwise attempt to load a raw model + model_features.csv and return is_pipeline=False.
    """
    # Try pipeline first
    if PIPELINE_FILE.exists():
        pipeline = joblib.load(PIPELINE_FILE)
        features = None
        if FEATURES_FILE.exists():
            try:
                features = pd.read_csv(FEATURES_FILE, header=None).iloc[:,0].astype(str).tolist()
            except Exception:
                features = None
        return pipeline, features, True

    if PIPELINE_ALT.exists():
        pipeline = joblib.load(PIPELINE_ALT)
        features = None
        if FEATURES_FILE.exists():
            try:
                features = pd.read_csv(FEATURES_FILE, header=None).iloc[:,0].astype(str).tolist()
            except Exception:
                features = None
        return pipeline, features, True

    # Fallback: try raw model + feature list
    for p in MODEL_FILE_CANDIDATES:
        if p.exists():
            model = joblib.load(p)
            if FEATURES_FILE.exists():
                try:
                    features = pd.read_csv(FEATURES_FILE, header=None).iloc[:,0].astype(str).tolist()
                except Exception:
                    features = None
            else:
                features = None
            return model, features, False

    # nothing found
    raise FileNotFoundError(f"No pipeline or model found in {ML_MODELS_DIR}. Searched pipeline: {PIPELINE_FILE}, candidates: {MODEL_FILE_CANDIDATES}")

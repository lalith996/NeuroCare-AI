# ml/feature_engineering_db.py
"""
Aggregate game_scores + patient clinical fields from DB into ml/training_table.csv
"""

import pandas as pd
from pathlib import Path
from backend.database import engine
# use SQLAlchemy engine with pandas read_sql
ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "training_table.csv"

# read patients (clinical columns)
patients_df = pd.read_sql("SELECT * FROM patients", con=engine)
# read original clinical CSV also to capture full clinical fields if patients table is sparse
clinical_csv = ROOT / "data" / "alzheimers_disease_data.csv"
clinical_df = pd.read_csv(clinical_csv)

# read game_scores
gs = pd.read_sql("SELECT * FROM game_scores", con=engine)

# if patients table lacks the full clinical features, use clinical_df keyed by PatientID/patient_code
# clinical_df has PatientID; game_scores has patient_code column named patient_code
clinical_df = clinical_df.rename(columns={"PatientID": "patient_code"})

# aggregate game features per patient_code
import numpy as np
agg = []
for pid, g in gs.groupby("patient_code"):
    rec = {"patient_code": pid}
    for game in g['game'].unique():
        gg = g[g['game'] == game].sort_values("id")  # use id as proxy for time if week not set
        rec[f"{game}_mean"] = gg['score'].mean()
        rec[f"{game}_std"] = gg['score'].std(ddof=0)
        # create week index if timestamp exists
        if 'timestamp_start' in gg.columns and gg['timestamp_start'].notnull().any():
            try:
                gg['ts'] = pd.to_datetime(gg['timestamp_start'])
                gg = gg.sort_values('ts')
                weeks = (gg['ts'] - gg['ts'].min()).dt.days // 7 + 1
                rec[f"{game}_slope"] = float(np.polyfit(weeks, gg['score'], 1)[0]) if len(gg) >= 2 else 0.0
            except Exception:
                rec[f"{game}_slope"] = 0.0
        else:
            rec[f"{game}_slope"] = 0.0
        rec[f"{game}_max_level"] = int(gg['level'].max()) if 'level' in gg.columns else 0
    rec["score_mean_all"] = g['score'].mean()
    rec["score_std_all"] = g['score'].std(ddof=0)
    rec["dur_mean"] = None
    agg.append(rec)

agg_df = pd.DataFrame(agg)

# merge with full clinical_df by patient_code
train_df = clinical_df.merge(agg_df, on="patient_code", how="inner")
# rename patient_code -> PatientID for compatibility
train_df = train_df.rename(columns={"patient_code": "PatientID"})

train_df.to_csv(OUT, index=False)
print("✅ training_table.csv written to", OUT)

"""
Baseline experiment for SARGEN pattern detection using MLflow.
- Computes simple account-level features from data/HI-Small_Trans.csv
- Labels: account in HI-Small_Patterns.txt => suspicious (1) else 0
- Trains a RandomForestClassifier and logs metrics + model to MLflow (local ./mlruns)

Run:
    python experiments\baseline_experiment.py

Notes:
- This script is intentionally simple and self-contained to bootstrap MLflow experiments.
"""
import os
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import mlflow
import mlflow.sklearn

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
TRANS_PATH = DATA_DIR / "HI-Small_Trans.csv"
PATTERNS_PATH = DATA_DIR / "HI-Small_Patterns.txt"

# Safety checks
if not TRANS_PATH.exists():
    raise FileNotFoundError(f"Transactions file not found: {TRANS_PATH}\nPlease place the dataset files in the data/ folder (see data/README.md)")

# Load transactions (read only needed columns to be memory-friendly)
usecols = ["Account", "Amount Paid", "Timestamp", "From Bank", "To Bank"]
print("Loading transactions (this may take a while)...")
trans = pd.read_csv(TRANS_PATH, usecols=lambda c: c in usecols)
trans.columns = [c.strip() for c in trans.columns]

# Load known pattern accounts
known_bad = set()
if PATTERNS_PATH.exists():
    with open(PATTERNS_PATH, "r", encoding="utf-8") as f:
        known_bad = {line.strip() for line in f if line.strip()}
else:
    print("Warning: patterns file not found; labeling will default to heuristic.")

# Aggregate per-account features
print("Aggregating features per account...")
trans["Account"] = trans["Account"].astype(str)
trans["Amount Paid"] = pd.to_numeric(trans["Amount Paid"], errors="coerce").fillna(0.0)

agg = trans.groupby("Account").agg(
    txn_count=("Amount Paid", "size"),
    total_amount=("Amount Paid", "sum"),
    avg_amount=("Amount Paid", "mean"),
    unique_destinations=("To Bank", lambda s: s.nunique())
).reset_index()

# Label: 1 if in known patterns, else 0
agg["label"] = agg["Account"].apply(lambda a: 1 if str(a) in known_bad else 0)

# If patterns file not available or extremely imbalanced, we create a heuristic label fallback
if agg["label"].sum() == 0:
    print("No ground truth suspicious accounts found — creating heuristic labels (top 1% by total_amount)")
    threshold = agg["total_amount"].quantile(0.99)
    agg["label"] = (agg["total_amount"] >= threshold).astype(int)

# Prepare dataset (sample if too large)
MAX_ROWS = 200000
if len(agg) > MAX_ROWS:
    agg = agg.sample(n=MAX_ROWS, random_state=42)

features = ["txn_count", "total_amount", "avg_amount", "unique_destinations"]
X = agg[features].fillna(0.0)
# Simple scaling to reduce numeric ranges
X["avg_amount"] = X["avg_amount"] / (X["avg_amount"].max() + 1e-9)
X["total_amount"] = X["total_amount"] / (X["total_amount"].max() + 1e-9)

y = agg["label"].astype(int)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# MLflow experiment
mlflow.set_experiment("sargen_pattern_detection_baseline")
with mlflow.start_run():
    params = {"n_estimators": 200, "max_depth": None, "random_state": 42}
    mlflow.log_params(params)

    model = RandomForestClassifier(n_estimators=params["n_estimators"], max_depth=params["max_depth"], random_state=params["random_state"]) 
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)

    mlflow.log_metric("accuracy", float(acc))
    mlflow.log_metric("precision", float(prec))
    mlflow.log_metric("recall", float(rec))
    mlflow.log_metric("f1_score", float(f1))

    # Log model
    mlflow.sklearn.log_model(model, "pattern_detection_model")

    print("Experiment completed and logged to MLflow")
    print(f"accuracy={acc:.4f}, precision={prec:.4f}, recall={rec:.4f}, f1={f1:.4f}")

print("Done. Check ./mlruns for experiment details or start an MLflow server to view the UI.")

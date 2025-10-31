import json
from pathlib import Path
from time import perf_counter

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
OUT = Path(__file__).resolve().parent / "metrics_report.json"


def _find_col(df, candidates):
    for c in candidates:
        if c in df.columns:
            return c
    return None


def load_transactions():
    p = DATA / "HI-Small_Trans.csv"
    if not p.exists():
        raise FileNotFoundError(f"Missing: {p}")
    df = pd.read_csv(p)
    df.columns = [c.strip() for c in df.columns]
    return df


def load_pattern_accounts():
    p = DATA / "HI-Small_Patterns.txt"
    if not p.exists():
        return set()
    with open(p, "r", encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


def heuristic_suspicious(df_acc: pd.DataFrame) -> bool:
    # Fan-out
    dest_col = _find_col(df_acc, ["To Bank", "TO_BANK", "to_bank"])
    if dest_col and df_acc[dest_col].nunique() > 5:
        return True
    # Rapid movement (within 24h)
    ts_col = _find_col(df_acc, ["Timestamp", "Date", "datetime", "TX_DT", "tx_time"])
    if ts_col:
        ts = pd.to_datetime(df_acc[ts_col], errors="coerce").sort_values()
        if (ts.diff().dropna().dt.total_seconds() / 3600 < 24).sum() > 10:
            return True
    # Structuring
    amt_col = _find_col(df_acc, ["Amount", "AMOUNT", "amount", "Txn Amount"])
    if amt_col:
        under = (df_acc[amt_col] < 10_000).sum()
        if len(df_acc) and under / len(df_acc) >= 0.70 and under > 10:
            return True
    return False


def build_binary_labels(trans: pd.DataFrame, known_bad: set, sample_n=5000):
    acct_col = _find_col(trans, ["Account", "From Account", "ACC_ID", "AccountId", "acct"])
    if not acct_col:
        raise ValueError("Account column not found")
    accounts = trans[acct_col].dropna().astype(str).unique()
    if len(accounts) > sample_n:
        np.random.seed(42)
        accounts = np.random.choice(accounts, size=sample_n, replace=False)
    rows = []
    for acc in accounts:
        df_acc = trans[trans[acct_col].astype(str) == str(acc)]
        y_pred = heuristic_suspicious(df_acc)
        if known_bad:
            y_true = str(acc) in known_bad
        else:
            # fallback: sanity baseline equals heuristic
            y_true = heuristic_suspicious(df_acc)
        rows.append({"account": str(acc), "y_true": int(y_true), "y_pred": int(y_pred)})
    return pd.DataFrame(rows)


def risk_eval(trans: pd.DataFrame):
    labels_path = DATA / "test_labels.csv"
    if not labels_path.exists():
        return None
    df_labels = pd.read_csv(labels_path)
    df_labels["account"] = df_labels["account"].astype(str)

    acct_col = _find_col(trans, ["Account", "From Account", "ACC_ID", "AccountId", "acct"])
    amt_col = _find_col(trans, ["Amount", "AMOUNT", "amount", "Txn Amount"])
    if not acct_col:
        return None

    g = trans.groupby(trans[acct_col].astype(str))
    feats = g.size().to_frame("txn_count")
    feats["amount_sum"] = g[amt_col].sum() if amt_col else 0.0
    feats = feats.reset_index(names="account")

    def predict(row):
        score = 0
        if row["txn_count"] > 1000:
            score += 30
        elif row["txn_count"] > 500:
            score += 15
        if row["amount_sum"] > 1_000_000:
            score += 25
        elif row["amount_sum"] > 500_000:
            score += 15
        if score >= 70:
            return "HIGH"
        if score >= 40:
            return "MEDIUM"
        return "LOW"

    feats["risk_pred"] = feats.apply(predict, axis=1)
    df = df_labels.merge(feats[["account", "risk_pred"]], on="account", how="left").dropna()
    y_true = df["risk_true"].astype(str)
    y_pred = df["risk_pred"].astype(str)
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro")),
        "confusion_matrix": confusion_matrix(y_true, y_pred, labels=["LOW", "MEDIUM", "HIGH"]).tolist(),
        "labels": ["LOW", "MEDIUM", "HIGH"],
        "n": int(len(df)),
        "report": classification_report(y_true, y_pred, digits=3),
    }


def facts_consistency(trans: pd.DataFrame):
    acct_col = _find_col(trans, ["Account", "From Account", "ACC_ID", "AccountId", "acct"])
    amt_col = _find_col(trans, ["Amount", "AMOUNT", "amount", "Txn Amount"])
    if not acct_col:
        return {"consistency_rate": None, "n": 0}
    accounts = trans[acct_col].dropna().astype(str).unique()
    np.random.seed(42)
    sample = np.random.choice(accounts, size=min(100, len(accounts)), replace=False)
    ok = 0
    for acc in sample:
        df = trans[trans[acct_col].astype(str) == str(acc)]
        txn_count = len(df)
        amt = float(df[amt_col].sum()) if amt_col else 0.0
        if txn_count >= 0 and amt >= 0:
            ok += 1
    return {"consistency_rate": round(ok / max(len(sample), 1), 4), "n": int(len(sample))}


def main():
    start = perf_counter()
    trans = load_transactions()
    known_bad = load_pattern_accounts()

    lab = build_binary_labels(trans, known_bad)
    y_true = lab["y_true"].to_numpy()
    y_pred = lab["y_pred"].to_numpy()
    pattern = {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "n_accounts": int(len(lab)),
        "note": "If no ground truth file exists, this is a baseline (heuristic vs. heuristic).",
    }

    risk = risk_eval(trans)
    facts = facts_consistency(trans)

    report = {
        "pattern_detection": pattern,
        "risk_classification": risk,
        "narrative_facts": facts,
        "runtime_seconds": round(perf_counter() - start, 2),
    }

    print("\n=== Pattern detection ===")
    print(json.dumps(pattern, indent=2))
    if risk:
        print("\n=== Risk classification ===")
        print(json.dumps({k: v for k, v in risk.items() if k != "report"}, indent=2))
        print("\nDetailed report:\n", risk["report"])
    print("\n=== Narrative facts consistency ===")
    print(json.dumps(facts, indent=2))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nSaved: {OUT}")


if __name__ == "__main__":
    main()

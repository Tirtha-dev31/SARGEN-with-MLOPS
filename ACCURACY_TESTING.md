# SARGEN – Accuracy & Testing (Concise)

Goals
- Quantify quality of: pattern detection, risk classification, SAR narrative factuality, AI chat relevance/latency.

Datasets
- data/HI-Small_Trans.csv
- data/HI-Small_accounts.csv
- data/HI-Small_Patterns.txt (known suspicious accounts)
- Optional: data/test_labels.csv (ground‑truth per account risk or suspicious flag)

Metrics we report
1) Pattern detection (binary suspicious vs normal)
   - Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = harmonic mean.
   - Confusion matrix.
2) Risk classification (HIGH/MEDIUM/LOW) – if labels exist
   - Accuracy, Macro‑F1, confusion matrix.
3) Narrative factual consistency (proxy)
   - % of sampled accounts where computed totals/counts/dates pass sanity checks.
4) AI chat
   - Latency (seconds).
   - Relevance score (1–5 human rubric or “LLM‑as‑judge” on fixed questions).
   - Hallucination rate (% conflicts with computed numbers).
5) System
   - Endpoint latency and run time.

How to run (Windows PowerShell)
- py -3 -m venv .venv
- .\.venv\Scripts\Activate.ps1
- pip install pandas numpy scikit-learn tqdm
- python tests\accuracy\run_metrics.py

Outputs
- tests/accuracy/metrics_report.json
- Console summary with Precision/Recall/F1, confusion matrices, and consistency rate.

Adding labels (improves validity)
- Provide data/test_labels.csv:
  - For binary: account,suspicious_true (0/1)
  - For risk class: account,risk_true (LOW|MEDIUM|HIGH)
- Script will auto‑use it; otherwise it falls back to a conservative heuristic baseline.

Human rubric for chat (1–5)
1 Wrong/irrelevant, 2 Partly relevant, 3 Mostly correct, 4 Correct & concise, 5 Excellent with exact numbers.

Targets you can aim for (adjust by data reality)
- Pattern detection: Precision ≥ 0.90, Recall ≥ 0.90, F1 ≥ 0.90
- Risk classification: Accuracy ≥ 0.85, Macro‑F1 ≥ 0.85
- Narrative facts consistency ≥ 0.95
- Chat median latency ≤ 6 s; mean relevance ≥ 4.0/5

Tip
- Keep a fixed question set at tests/accuracy/sample_questions.json for consistent chat scoring across versions.

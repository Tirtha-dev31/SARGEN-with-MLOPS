# SARGEN MLOps Implementation Plan

## 🎯 Overview
Transform SARGEN from a monolithic application to an MLOps-enabled system with:
- Model versioning and registry
- Automated training pipelines
- Model monitoring and drift detection
- CI/CD for ML models
- Experiment tracking
- Feature store
- Model serving infrastructure

---

## 📋 Current State (v1.0 - Baseline)

### What We Have:
- ✅ Pattern detection algorithms (rule-based)
- ✅ Risk scoring (deterministic)
- ✅ Local LLM (Ollama Llama 3.2)
- ✅ FastAPI backend
- ✅ React frontend
- ✅ Data processing pipeline

### What's Missing (MLOps):
- ❌ Model versioning
- ❌ Experiment tracking
- ❌ Automated retraining
- ❌ Model monitoring
- ❌ Feature store
- ❌ CI/CD for ML models
- ❌ A/B testing infrastructure
- ❌ Model performance metrics

---

## 🏗️ MLOps Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Raw Data → Feature Store → Training Data → Model Registry  │
│  (CSV)      (Feast/Redis)   (Versioned)     (MLflow)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   ML PIPELINE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Data Validation → Feature Engineering → Model Training     │
│  (Great Expectations) (Scikit-learn)   (XGBoost/PyTorch)   │
│                                                              │
│  → Hyperparameter Tuning → Model Evaluation → Registry     │
│     (Optuna)                (Metrics)         (MLflow)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 MODEL SERVING LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Model API (FastAPI) → Prediction Cache → A/B Testing      │
│  Model Versioning    → Load Balancer    → Canary Deploy    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 MONITORING LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Data Drift Detection → Model Performance → Alerts          │
│  (Evidently AI)         (Prometheus)        (Slack/Email)   │
│                                                              │
│  → Dashboard (Grafana) → Automated Retraining Trigger       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ MLOps Stack Selection

### Core MLOps Tools:

| Component | Tool | Why |
|-----------|------|-----|
| **Experiment Tracking** | MLflow | Industry standard, open-source, easy integration |
| **Feature Store** | Feast | Lightweight, local-first, scalable |
| **Model Registry** | MLflow Model Registry | Built-in versioning, staging |
| **Pipeline Orchestration** | Airflow / Prefect | Workflow automation, scheduling |
| **Model Serving** | FastAPI + MLflow | Already using FastAPI |
| **Monitoring** | Evidently AI + Prometheus | Drift detection + metrics |
| **Containerization** | Docker + Docker Compose | Easy deployment |
| **CI/CD** | GitHub Actions | Free, integrated with GitHub |
| **Data Validation** | Great Expectations | Data quality checks |
| **Hyperparameter Tuning** | Optuna | Modern, efficient |

---

## 📝 Implementation Phases

### **Phase 1: Setup MLOps Infrastructure (Week 1-2)**

#### 1.1 Project Structure Refactoring
```
sargen-mlops/
├── data/
│   ├── raw/                    # Raw CSV files
│   ├── processed/              # Processed features
│   └── feature_store/          # Feast feature store
│
├── models/
│   ├── pattern_detection/      # Pattern detection models
│   ├── risk_scoring/           # Risk scoring models
│   └── sar_generation/         # SAR text generation
│
├── pipelines/
│   ├── data_validation.py      # Data quality checks
│   ├── feature_engineering.py  # Feature extraction
│   ├── training.py             # Model training pipeline
│   └── evaluation.py           # Model evaluation
│
├── mlops/
│   ├── mlflow/                 # MLflow configuration
│   ├── feast/                  # Feast feature store
│   ├── monitoring/             # Monitoring scripts
│   └── serving/                # Model serving
│
├── experiments/                # Jupyter notebooks
├── tests/                      # Unit & integration tests
├── docker/                     # Docker files
├── .github/workflows/          # CI/CD pipelines
└── config/                     # Configuration files
```

#### 1.2 Install MLOps Dependencies
```bash
# Add to requirements.txt
mlflow==2.8.0
feast==0.34.0
evidently==0.4.10
great-expectations==0.18.0
optuna==3.4.0
prefect==2.14.0
prometheus-client==0.18.0
```

---

### **Phase 2: Experiment Tracking with MLflow (Week 2-3)**

#### 2.1 Setup MLflow Server
```python
# mlops/setup_mlflow.py
import mlflow
import os

# Configure MLflow
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("sargen_pattern_detection")

# Log parameters
mlflow.log_param("algorithm", "random_forest")
mlflow.log_param("n_estimators", 100)

# Log metrics
mlflow.log_metric("accuracy", 0.95)
mlflow.log_metric("f1_score", 0.93)

# Log model
mlflow.sklearn.log_model(model, "pattern_detection_model")
```

#### 2.2 Track Experiments
```bash
# Start MLflow UI
mlflow server --host 0.0.0.0 --port 5000

# Access at: http://localhost:5000
```

---

### **Phase 3: Feature Store with Feast (Week 3-4)**

#### 3.1 Define Features
```python
# mlops/feast/features.py
from feast import Entity, FeatureView, Field
from feast.types import Float32, Int64, String

# Define account entity
account = Entity(
    name="account",
    join_keys=["account_id"],
    description="Account identifier"
)

# Define transaction features
transaction_features = FeatureView(
    name="transaction_features",
    entities=[account],
    schema=[
        Field(name="total_amount", dtype=Float32),
        Field(name="transaction_count", dtype=Int64),
        Field(name="avg_amount", dtype=Float32),
        Field(name="unique_destinations", dtype=Int64),
        Field(name="rapid_movement_count", dtype=Int64),
    ]
)
```

#### 3.2 Materialize Features
```bash
feast apply
feast materialize-incremental $(date +%Y-%m-%d)
```

---

### **Phase 4: Automated Training Pipeline (Week 4-5)**

#### 4.1 Create Training Pipeline
```python
# pipelines/training_pipeline.py
from prefect import flow, task
import mlflow
from sklearn.ensemble import RandomForestClassifier

@task
def load_data():
    """Load and validate data"""
    data = pd.read_csv('data/processed/features.csv')
    return data

@task
def train_model(data):
    """Train pattern detection model"""
    X = data.drop('suspicious', axis=1)
    y = data['suspicious']
    
    with mlflow.start_run():
        model = RandomForestClassifier(n_estimators=100)
        model.fit(X_train, y_train)
        
        # Log metrics
        accuracy = model.score(X_test, y_test)
        mlflow.log_metric("accuracy", accuracy)
        
        # Log model
        mlflow.sklearn.log_model(model, "pattern_detection")
    
    return model

@flow
def ml_training_pipeline():
    """Complete ML training pipeline"""
    data = load_data()
    model = train_model(data)
    return model
```

#### 4.2 Schedule Pipeline
```python
# Run daily at 2 AM
from prefect.deployments import Deployment

deployment = Deployment.build_from_flow(
    flow=ml_training_pipeline,
    name="daily_training",
    schedule={"cron": "0 2 * * *"}
)
```

---

### **Phase 5: Model Serving & Versioning (Week 5-6)**

#### 5.1 Model Serving API
```python
# mlops/serving/model_server.py
from fastapi import FastAPI
import mlflow.sklearn

app = FastAPI()

# Load production model
model_uri = "models:/pattern_detection/production"
model = mlflow.sklearn.load_model(model_uri)

@app.post("/predict")
async def predict(features: dict):
    prediction = model.predict([features])
    return {"suspicious": bool(prediction[0])}

@app.get("/model/version")
async def get_model_version():
    return {"version": mlflow.get_model_version()}
```

#### 5.2 Model Registry Workflow
```python
# Promote model to production
client = mlflow.tracking.MlflowClient()

# Register model
model_uri = "runs:/abc123/model"
client.create_registered_model("pattern_detection")

# Transition to production
client.transition_model_version_stage(
    name="pattern_detection",
    version=3,
    stage="Production"
)
```

---

### **Phase 6: Monitoring & Drift Detection (Week 6-7)**

#### 6.1 Data Drift Monitoring
```python
# mlops/monitoring/drift_detection.py
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

report = Report(metrics=[DataDriftPreset()])

report.run(
    reference_data=reference_df,
    current_data=production_df,
    column_mapping=ColumnMapping()
)

# Check for drift
if report.as_dict()['metrics'][0]['result']['dataset_drift']:
    trigger_retraining()
```

#### 6.2 Model Performance Monitoring
```python
# Track metrics with Prometheus
from prometheus_client import Counter, Histogram

prediction_counter = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency')

@app.post("/predict")
async def predict(features: dict):
    with prediction_latency.time():
        result = model.predict([features])
    prediction_counter.inc()
    return result
```

---

### **Phase 7: CI/CD for ML Models (Week 7-8)**

#### 7.1 GitHub Actions Workflow
```yaml
# .github/workflows/ml_pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  data-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate data quality
        run: |
          python pipelines/data_validation.py
  
  train-model:
    needs: data-validation
    runs-on: ubuntu-latest
    steps:
      - name: Train model
        run: |
          python pipelines/training.py
      
      - name: Evaluate model
        run: |
          python pipelines/evaluation.py
      
      - name: Register model
        if: success()
        run: |
          python mlops/register_model.py
  
  deploy-model:
    needs: train-model
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          docker build -t sargen-ml:latest .
          docker push sargen-ml:latest
```

---

## 🎯 Quick Start: Day 1 Implementation

### Step 1: Push Current Version to GitHub
```bash
# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/sargen.git
git push -u origin main
```

### Step 2: Clone for MLOps
```bash
cd ..
git clone https://github.com/YOUR_USERNAME/sargen.git sargen-mlops
cd sargen-mlops
git checkout -b mlops-integration
```

### Step 3: Install MLOps Tools
```bash
# Create MLOps virtual environment
python -m venv venv-mlops
venv-mlops\Scripts\activate

# Install core MLOps packages
pip install mlflow feast evidently great-expectations optuna prefect
```

### Step 4: Setup MLflow
```bash
# Start MLflow tracking server
mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:///mlflow.db

# Access UI: http://localhost:5000
```

### Step 5: Create First Experiment
```python
# experiments/baseline_experiment.py
import mlflow
from sklearn.ensemble import RandomForestClassifier

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("sargen_baseline")

with mlflow.start_run(run_name="baseline_random_forest"):
    # Your existing pattern detection code
    model = RandomForestClassifier()
    # ... training code ...
    
    mlflow.log_param("algorithm", "random_forest")
    mlflow.log_metric("accuracy", accuracy)
    mlflow.sklearn.log_model(model, "model")
```

---

## 📊 Success Metrics for MLOps

### Technical Metrics:
- ✅ Model retraining automated (weekly/monthly)
- ✅ Drift detection alerts configured
- ✅ Model version tracking in place
- ✅ CI/CD pipeline running
- ✅ <5 min model deployment time
- ✅ Model performance monitored in real-time

### Business Metrics:
- ✅ Pattern detection accuracy > 95%
- ✅ False positive rate < 5%
- ✅ Model explainability reports generated
- ✅ Compliance audit trail maintained
- ✅ A/B test results tracked

---

## 🔄 Iterative Improvement Plan

### Month 1: Foundation
- Setup MLflow and experiment tracking
- Implement basic feature store
- Create training pipeline

### Month 2: Automation
- Automate model training
- Setup CI/CD pipelines
- Implement monitoring

### Month 3: Advanced
- A/B testing framework
- Advanced drift detection
- Model ensemble strategies

### Month 4: Production Hardening
- Performance optimization
- Security hardening
- Documentation

---

## 📚 Learning Resources

### Courses:
- [MLOps Specialization - Coursera](https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops)
- [Full Stack Deep Learning](https://fullstackdeeplearning.com/)
- [Made With ML - MLOps](https://madewithml.com/)

### Tools Documentation:
- [MLflow Docs](https://mlflow.org/docs/latest/index.html)
- [Feast Docs](https://docs.feast.dev/)
- [Evidently AI Docs](https://docs.evidentlyai.com/)

---

## 🚀 Next Steps

1. **Push current version to GitHub** ✅
2. **Clone and create mlops-integration branch**
3. **Install MLflow and start tracking experiments**
4. **Convert existing models to MLflow format**
5. **Setup feature store for transaction data**
6. **Create automated training pipeline**
7. **Implement monitoring dashboard**
8. **Setup CI/CD with GitHub Actions**

---

**Ready to start?** Let me know and I'll help you with each step! 🎯

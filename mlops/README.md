# MLOps Infrastructure for SARGEN

This directory contains the MLOps infrastructure setup for SARGEN's fraud detection ML pipeline.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DVC       │────▶│   MLflow    │────▶│ Production  │
│  Pipeline   │     │  Tracking   │     │   Model     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │                    │                    │
   ┌──▼──┐            ┌────▼────┐         ┌────▼────┐
   │Data │            │PostgreSQL│         │  MinIO  │
   │Cache│            │Backend   │         │Artifacts│
   └─────┘            └──────────┘         └─────────┘
```

## 🚀 Quick Start

### 1. Start MLflow Stack

```bash
# From the mlops directory
cd mlops
docker-compose up -d

# Check services are running
docker-compose ps
```

Access services:
- **MLflow UI**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)
- **PostgreSQL**: localhost:5432

### 2. Run DVC Pipeline

```bash
# From project root
cd ..

# Run the full pipeline
dvc repro

# View pipeline DAG
dvc dag

# Check metrics
dvc metrics show
```

### 3. View Results in MLflow

Open browser to http://localhost:5000 to see:
- Experiment runs with metrics (accuracy, precision, recall, F1)
- Model artifacts and parameters
- Comparison across runs

## 📊 DVC Pipeline Stages

The ML pipeline consists of 4 stages:

1. **prepare_data**: Load and clean raw transaction data
2. **feature_engineering**: Create features from transactions
3. **train**: Train RandomForest fraud detection model (logs to MLflow)
4. **evaluate**: Evaluate model and generate metrics

## 🔧 Configuration

Edit `params.yaml` to tune hyperparameters, then run `dvc repro`.

## 🎯 Model Registry & Deployment

### Promote Model to Production

```bash
# List registered models
python scripts/promote_model.py --list

# Promote latest model to production
python scripts/promote_model.py --stage Production
```

## 📝 Common Commands

```bash
# View pipeline status
dvc status

# Show metrics
dvc metrics show

# Run specific stage
dvc repro train

# Stop services
docker-compose down
```

## 🔐 Security Notes

- Change default passwords in `.env` file
- Use secrets management for production
- Enable authentication for MLflow in production

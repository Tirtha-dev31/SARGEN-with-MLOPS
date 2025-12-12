"""
Model Training Script for DVC Pipeline
Trains fraud detection model and logs to MLflow
"""
import pandas as pd
import yaml
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import json
import os
from pathlib import Path

def load_params():
    """Load parameters from params.yaml"""
    with open('params.yaml', 'r') as f:
        return yaml.safe_load(f)

def load_features():
    """Load engineered features"""
    features = pd.read_csv('data/features/features.csv')
    labels = pd.read_csv('data/features/labels.csv')
    return features, labels

def train_model(params):
    """
    Train RandomForest model with MLflow tracking
    """
    # Load data
    print("Loading features...")
    X, y = load_features()
    
    # Split data
    test_size = params['train']['test_size']
    random_state = params['random_state']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Start MLflow run
    mlflow.set_experiment(params['mlflow']['experiment_name'])
    
    with mlflow.start_run(run_name=params['mlflow']['run_name']):
        # Log parameters
        mlflow.log_params(params['train']['model_params'])
        mlflow.log_param('test_size', test_size)
        mlflow.log_param('random_state', random_state)
        
        # Train model
        print("Training RandomForest model...")
        model = RandomForestClassifier(
            **params['train']['model_params'],
            random_state=random_state
        )
        model.fit(X_train, y_train)
        
        # Evaluate on test set
        y_pred = model.predict(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0)
        }
        
        # Log metrics
        for metric_name, metric_value in metrics.items():
            mlflow.log_metric(metric_name, metric_value)
        
        print("\nModel Performance:")
        for metric_name, metric_value in metrics.items():
            print(f"  {metric_name}: {metric_value:.4f}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        model_path = 'models/fraud_detector.pkl'
        joblib.dump(model, model_path)
        
        # Log model to MLflow
        mlflow.sklearn.log_model(
            model, 
            "model",
            registered_model_name=params['mlflow']['model_name']
        )
        
        # Save metrics for DVC
        os.makedirs('metrics', exist_ok=True)
        with open('metrics/train_metrics.json', 'w') as f:
            json.dump(metrics, f, indent=2)
        
        print(f"\n✓ Model saved to {model_path}")
        print(f"✓ Metrics saved to metrics/train_metrics.json")
        print(f"✓ MLflow run completed: {mlflow.active_run().info.run_id}")

if __name__ == '__main__':
    params = load_params()
    train_model(params)

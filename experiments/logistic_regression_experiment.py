"""
Logistic Regression experiment for SARGEN pattern detection
Tracks experiment with MLflow
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import mlflow
import mlflow.sklearn
import os

# Set MLflow tracking URI
mlflow.set_tracking_uri("file:///./mlruns")
mlflow.set_experiment("sargen_pattern_detection_logistic_regression")

print("Loading transactions (this may take a while)...")
df = pd.read_csv('data/HI-Small_Trans.csv')

print("Aggregating features per account...")
account_features = df.groupby('Account').agg({
    'Amount Received': ['count', 'sum', 'mean', 'std', 'min', 'max'],
    'Account.1': 'nunique'  # unique destinations
}).reset_index()

account_features.columns = ['account_id', 'txn_count', 'total_amount', 'avg_amount', 
                           'std_amount', 'min_amount', 'max_amount', 'unique_destinations']
account_features.fillna(0, inplace=True)

# Create labels (heuristic: top 1% by total_amount as suspicious)
threshold = account_features['total_amount'].quantile(0.99)
account_features['is_suspicious'] = (account_features['total_amount'] >= threshold).astype(int)

print(f"Created labels - Suspicious: {account_features['is_suspicious'].sum()}, Normal: {(~account_features['is_suspicious'].astype(bool)).sum()}")

# Prepare features and labels
X = account_features[['txn_count', 'total_amount', 'avg_amount', 'std_amount', 
                      'min_amount', 'max_amount', 'unique_destinations']]
y = account_features['is_suspicious']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Start MLflow run
with mlflow.start_run(run_name="logistic_regression_v1"):
    # Hyperparameters
    params = {
        'penalty': 'l2',
        'C': 1.0,
        'solver': 'lbfgs',
        'max_iter': 1000,
        'random_state': 42,
        'class_weight': 'balanced'
    }
    
    # Log parameters
    mlflow.log_params(params)
    
    # Scale features
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Logistic Regression model...")
    model = LogisticRegression(**params)
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("recall", recall)
    mlflow.log_metric("f1_score", f1)
    mlflow.log_metric("roc_auc", auc)
    
    # Log feature coefficients
    feature_coefficients = dict(zip(X.columns, model.coef_[0]))
    for feat, coef in feature_coefficients.items():
        mlflow.log_metric(f"coefficient_{feat}", coef)
    
    # Log model with scaler
    class LogisticRegressionWithScaler:
        def __init__(self, scaler, model):
            self.scaler = scaler
            self.model = model
        
        def predict(self, X):
            X_scaled = self.scaler.transform(X)
            return self.model.predict(X_scaled)
        
        def predict_proba(self, X):
            X_scaled = self.scaler.transform(X)
            return self.model.predict_proba(X_scaled)
    
    wrapped_model = LogisticRegressionWithScaler(scaler, model)
    mlflow.sklearn.log_model(wrapped_model, "logistic_regression_model", 
                            registered_model_name="sargen_logistic_regression")
    
    print("\nExperiment completed and logged to MLflow")
    print(f"accuracy={accuracy:.4f}, precision={precision:.4f}, recall={recall:.4f}, f1={f1:.4f}, auc={auc:.4f}")

print("Done. Check ./mlruns for experiment details or start an MLflow server to view the UI.")

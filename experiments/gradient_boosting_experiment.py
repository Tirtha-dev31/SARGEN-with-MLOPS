"""
Gradient Boosting experiment for SARGEN pattern detection
Tracks experiment with MLflow
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import mlflow
import mlflow.sklearn
import os

# Set MLflow tracking URI
mlflow.set_tracking_uri("file:///./mlruns")
mlflow.set_experiment("sargen_pattern_detection_gradient_boosting")

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

# Create labels (heuristic: top 2% by total_amount as suspicious)
threshold = account_features['total_amount'].quantile(0.98)
account_features['is_suspicious'] = (account_features['total_amount'] >= threshold).astype(int)

print(f"Created labels - Suspicious: {account_features['is_suspicious'].sum()}, Normal: {(~account_features['is_suspicious'].astype(bool)).sum()}")

# Prepare features and labels
X = account_features[['txn_count', 'total_amount', 'avg_amount', 'std_amount', 
                      'min_amount', 'max_amount', 'unique_destinations']]
y = account_features['is_suspicious']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Start MLflow run
with mlflow.start_run(run_name="gradient_boosting_v1"):
    # Hyperparameters
    params = {
        'n_estimators': 150,
        'learning_rate': 0.1,
        'max_depth': 5,
        'min_samples_split': 2,
        'min_samples_leaf': 1,
        'subsample': 0.8,
        'random_state': 42
    }
    
    # Log parameters
    mlflow.log_params(params)
    
    # Train model
    print("Training Gradient Boosting model...")
    model = GradientBoostingClassifier(**params)
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("recall", recall)
    mlflow.log_metric("f1_score", f1)
    
    # Log feature importance
    feature_importance = dict(zip(X.columns, model.feature_importances_))
    for feat, importance in feature_importance.items():
        mlflow.log_metric(f"feature_importance_{feat}", importance)
    
    # Log model
    mlflow.sklearn.log_model(model, "gradient_boosting_model", 
                            registered_model_name="sargen_gradient_boosting")
    
    print("\nExperiment completed and logged to MLflow")
    print(f"accuracy={accuracy:.4f}, precision={precision:.4f}, recall={recall:.4f}, f1={f1:.4f}")

print("Done. Check ./mlruns for experiment details or start an MLflow server to view the UI.")

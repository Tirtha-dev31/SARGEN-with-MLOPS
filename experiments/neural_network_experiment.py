"""
Neural Network (MLP) experiment for SARGEN pattern detection
Tracks experiment with MLflow
"""
import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import mlflow
import mlflow.sklearn
import os

# Set MLflow tracking URI
mlflow.set_tracking_uri("file:///./mlruns")
mlflow.set_experiment("sargen_pattern_detection_neural_network")

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
with mlflow.start_run(run_name="neural_network_v1"):
    # Hyperparameters
    params = {
        'hidden_layer_sizes': (128, 64, 32),
        'activation': 'relu',
        'solver': 'adam',
        'alpha': 0.001,
        'batch_size': 32,
        'learning_rate': 'adaptive',
        'learning_rate_init': 0.001,
        'max_iter': 500,
        'random_state': 42,
        'early_stopping': True,
        'validation_fraction': 0.1
    }
    
    # Log parameters
    mlflow.log_params(params)
    
    # Scale features (neural networks need normalized inputs)
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Neural Network model...")
    model = MLPClassifier(**params)
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    
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
    mlflow.log_metric("n_iterations", model.n_iter_)
    mlflow.log_metric("n_layers", model.n_layers_)
    
    # Log model with scaler
    class NeuralNetworkWithScaler:
        def __init__(self, scaler, model):
            self.scaler = scaler
            self.model = model
        
        def predict(self, X):
            X_scaled = self.scaler.transform(X)
            return self.model.predict(X_scaled)
        
        def predict_proba(self, X):
            X_scaled = self.scaler.transform(X)
            return self.model.predict_proba(X_scaled)
    
    wrapped_model = NeuralNetworkWithScaler(scaler, model)
    mlflow.sklearn.log_model(wrapped_model, "neural_network_model", 
                            registered_model_name="sargen_neural_network")
    
    print("\nExperiment completed and logged to MLflow")
    print(f"accuracy={accuracy:.4f}, precision={precision:.4f}, recall={recall:.4f}, f1={f1:.4f}")
    print(f"Training iterations: {model.n_iter_}")

print("Done. Check ./mlruns for experiment details or start an MLflow server to view the UI.")

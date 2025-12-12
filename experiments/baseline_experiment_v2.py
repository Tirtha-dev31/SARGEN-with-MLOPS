"""
Random Forest baseline experiment v2 with different hyperparameters
Tracks experiment with MLflow
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import mlflow
import mlflow.sklearn
import joblib

# Set MLflow tracking URI
mlflow.set_tracking_uri("file:///./mlruns")
mlflow.set_experiment("sargen_pattern_detection_baseline")

print("Loading transactions...")
df = pd.read_csv('data/HI-Small_Trans.csv')

print("Aggregating features per account...")
account_features = df.groupby('Account').agg({
    'Amount Received': ['count', 'sum', 'mean', 'std', 'min', 'max'],
    'Account.1': 'nunique'
}).reset_index()

account_features.columns = ['account_id', 'txn_count', 'total_amount', 'avg_amount', 
                           'std_amount', 'min_amount', 'max_amount', 'unique_destinations']
account_features.fillna(0, inplace=True)

# Labels
threshold = account_features['total_amount'].quantile(0.99)
account_features['is_suspicious'] = (account_features['total_amount'] >= threshold).astype(int)

X = account_features[['txn_count', 'total_amount', 'avg_amount', 'std_amount', 
                      'min_amount', 'max_amount', 'unique_destinations']]
y = account_features['is_suspicious']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Run with different hyperparameters
with mlflow.start_run(run_name="random_forest_v2_deep"):
    params = {
        'n_estimators': 200,
        'max_depth': 15,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'random_state': 42
    }
    
    mlflow.log_params(params)
    
    print("Training Random Forest v2...")
    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("recall", recall)
    mlflow.log_metric("f1_score", f1)
    
    mlflow.sklearn.log_model(model, "pattern_detection_model",
                            registered_model_name="sargen_random_forest_v2")
    
    print(f"Completed: accuracy={accuracy:.4f}, precision={precision:.4f}, recall={recall:.4f}, f1={f1:.4f}")

print("Done!")

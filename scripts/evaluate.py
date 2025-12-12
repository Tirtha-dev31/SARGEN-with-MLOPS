"""
Model Evaluation Script for DVC Pipeline
Evaluates trained model and generates detailed metrics
"""
import pandas as pd
import numpy as np
import yaml
import json
import joblib
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import mlflow
import os
from pathlib import Path

def load_params():
    """Load parameters from params.yaml"""
    with open('params.yaml', 'r') as f:
        return yaml.safe_load(f)

def evaluate_model(params):
    """
    Evaluate model on test set and generate comprehensive metrics
    """
    print("Loading model and test data...")
    
    # Load model
    model = joblib.load('models/fraud_detector.pkl')
    
    # Load features and labels
    X = pd.read_csv('data/features/features.csv')
    y = pd.read_csv('data/features/labels.csv')['label']
    
    # Make predictions
    print("Generating predictions...")
    y_pred = model.predict(X)
    y_pred_proba = model.predict_proba(X)[:, 1] if hasattr(model, 'predict_proba') else None
    
    # Calculate metrics
    metrics = {
        'accuracy': float(accuracy_score(y, y_pred)),
        'precision': float(precision_score(y, y_pred, average='weighted', zero_division=0)),
        'recall': float(recall_score(y, y_pred, average='weighted', zero_division=0)),
        'f1_score': float(f1_score(y, y_pred, average='weighted', zero_division=0))
    }
    
    if y_pred_proba is not None and len(np.unique(y)) == 2:
        try:
            metrics['auc_roc'] = float(roc_auc_score(y, y_pred_proba))
        except:
            metrics['auc_roc'] = None
    
    # Confusion matrix
    cm = confusion_matrix(y, y_pred)
    metrics['confusion_matrix'] = cm.tolist()
    
    # Classification report
    report = classification_report(y, y_pred, output_dict=True, zero_division=0)
    metrics['classification_report'] = report
    
    # Feature importance if available
    if hasattr(model, 'feature_importances_'):
        feature_names = X.columns.tolist()
        importances = model.feature_importances_
        feature_importance = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True
        )[:10]  # Top 10 features
        metrics['top_features'] = [
            {'feature': name, 'importance': float(imp)} 
            for name, imp in feature_importance
        ]
    
    # Save detailed metrics
    os.makedirs('metrics', exist_ok=True)
    with open('metrics/evaluation_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # Save predictions
    predictions_df = pd.DataFrame({
        'actual': y,
        'predicted': y_pred,
        'probability': y_pred_proba if y_pred_proba is not None else y_pred
    })
    predictions_df.to_csv('metrics/predictions.csv', index=False)
    
    print("\n" + "="*60)
    print("MODEL EVALUATION RESULTS")
    print("="*60)
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1_score']:.4f}")
    if metrics.get('auc_roc'):
        print(f"AUC-ROC:   {metrics['auc_roc']:.4f}")
    
    print("\nConfusion Matrix:")
    print(cm)
    
    if metrics.get('top_features'):
        print("\nTop 10 Most Important Features:")
        for feat in metrics['top_features']:
            print(f"  {feat['feature']}: {feat['importance']:.4f}")
    
    print("\n✓ Evaluation complete")
    print("✓ Metrics saved to metrics/evaluation_metrics.json")
    print("✓ Predictions saved to metrics/predictions.csv")
    
    # Check model quality thresholds
    min_accuracy = params['evaluation']['min_accuracy']
    min_f1 = params['evaluation']['min_f1_score']
    
    if metrics['accuracy'] < min_accuracy or metrics['f1_score'] < min_f1:
        print("\n⚠️  WARNING: Model performance below thresholds!")
        print(f"   Accuracy: {metrics['accuracy']:.4f} (min: {min_accuracy})")
        print(f"   F1 Score: {metrics['f1_score']:.4f} (min: {min_f1})")
        return 1
    else:
        print("\n✓ Model meets quality thresholds")
        return 0

if __name__ == '__main__':
    params = load_params()
    exit_code = evaluate_model(params)
    exit(exit_code)

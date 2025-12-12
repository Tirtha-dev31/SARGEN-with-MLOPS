"""
Feature Engineering Script for DVC Pipeline
Creates features from prepared transaction data
"""
import pandas as pd
import numpy as np
import yaml
import json
import os
from pathlib import Path

def load_params():
    """Load parameters from params.yaml"""
    with open('params.yaml', 'r') as f:
        return yaml.safe_load(f)

def engineer_features(params):
    """
    Create account-level features from transactions
    """
    print("Loading prepared data...")
    trans_df = pd.read_csv('data/prepared/transactions.csv')
    accounts_df = pd.read_csv('data/prepared/accounts.csv')
    
    print(f"Engineering features for {len(accounts_df)} accounts...")
    
    # Aggregate transaction features per account
    agg_features = trans_df.groupby('Account').agg({
        'Amount': ['count', 'sum', 'mean', 'std', 'min', 'max'],
        'Receiving Currency': 'nunique',
        'Payment Currency': 'nunique',
        'Payment Format': 'nunique'
    }).reset_index()
    
    # Flatten column names
    agg_features.columns = ['_'.join(col).strip() if col[1] else col[0] 
                            for col in agg_features.columns.values]
    agg_features.rename(columns={'Account_': 'Account'}, inplace=True)
    
    # Add velocity features
    trans_df['Timestamp'] = pd.to_datetime(trans_df['Timestamp'])
    trans_df = trans_df.sort_values(['Account', 'Timestamp'])
    
    # Transaction velocity (transactions per day)
    velocity = trans_df.groupby('Account').apply(
        lambda x: len(x) / max((x['Timestamp'].max() - x['Timestamp'].min()).days, 1)
    ).reset_index(name='txn_velocity')
    
    # Merge features
    features = agg_features.merge(velocity, on='Account', how='left')
    features = features.merge(accounts_df[['Account']], on='Account', how='right')
    features = features.fillna(0)
    
    # Create labels (heuristic: top 1% by transaction amount)
    threshold = features['Amount_sum'].quantile(0.99)
    labels = (features['Amount_sum'] >= threshold).astype(int)
    
    # If patterns file exists, use it for labeling
    patterns_file = 'data/HI-Small_Patterns.txt'
    if os.path.exists(patterns_file):
        print("Loading suspicious patterns...")
        with open(patterns_file, 'r') as f:
            suspicious_accounts = set(line.strip() for line in f if line.strip())
        
        if suspicious_accounts:
            labels = features['Account'].isin(suspicious_accounts).astype(int)
            print(f"Found {labels.sum()} labeled suspicious accounts")
    
    # Remove Account column from features
    feature_cols = [col for col in features.columns if col != 'Account']
    X = features[feature_cols]
    y = pd.DataFrame({'label': labels}, index=features.index)
    
    # Save features and labels
    os.makedirs('data/features', exist_ok=True)
    X.to_csv('data/features/features.csv', index=False)
    y.to_csv('data/features/labels.csv', index=False)
    
    # Save feature metadata
    feature_info = {
        'num_features': len(feature_cols),
        'feature_names': feature_cols,
        'num_samples': len(X),
        'num_suspicious': int(labels.sum()),
        'class_balance': {
            'normal': int((labels == 0).sum()),
            'suspicious': int(labels.sum())
        }
    }
    
    with open('data/features/feature_info.json', 'w') as f:
        json.dump(feature_info, f, indent=2)
    
    print(f"\n✓ Features saved to data/features/")
    print(f"  Features: {feature_info['num_features']}")
    print(f"  Samples: {feature_info['num_samples']}")
    print(f"  Suspicious accounts: {feature_info['num_suspicious']}")

if __name__ == '__main__':
    params = load_params()
    engineer_features(params)

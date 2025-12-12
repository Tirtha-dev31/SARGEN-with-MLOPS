"""
Data Preparation Script for DVC Pipeline
Loads raw transaction data, performs cleaning and validation
"""
import pandas as pd
import yaml
import json
import os
from pathlib import Path

def load_params():
    """Load parameters from params.yaml"""
    with open('params.yaml', 'r') as f:
        return yaml.safe_load(f)

def prepare_data(params):
    """
    Load and prepare transaction data
    """
    print("Loading raw transaction data...")
    
    # Load transactions
    trans_df = pd.read_csv('data/HI-Small_Trans.csv')
    accounts_df = pd.read_csv('data/HI-Small_accounts.csv')
    
    print(f"Loaded {len(trans_df)} transactions, {len(accounts_df)} accounts")
    
    # Basic data validation
    trans_df = trans_df.dropna(subset=['Amount', 'Account'])
    
    # Filter by date range if specified
    if 'date_range' in params['data']:
        trans_df['Timestamp'] = pd.to_datetime(trans_df['Timestamp'])
        # Add date filtering logic here if needed
    
    # Sample data if specified
    if params['data'].get('sample_size'):
        sample_size = params['data']['sample_size']
        if sample_size < len(trans_df):
            trans_df = trans_df.sample(n=sample_size, random_state=params['random_state'])
            print(f"Sampled {sample_size} transactions")
    
    # Save prepared data
    os.makedirs('data/prepared', exist_ok=True)
    trans_df.to_csv('data/prepared/transactions.csv', index=False)
    accounts_df.to_csv('data/prepared/accounts.csv', index=False)
    
    # Save metadata
    metadata = {
        'num_transactions': len(trans_df),
        'num_accounts': len(accounts_df),
        'date_range': [str(trans_df['Timestamp'].min()), str(trans_df['Timestamp'].max())] if 'Timestamp' in trans_df.columns else None
    }
    
    with open('data/prepared/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Prepared data saved to data/prepared/")
    print(f"  Transactions: {metadata['num_transactions']}")
    print(f"  Accounts: {metadata['num_accounts']}")

if __name__ == '__main__':
    params = load_params()
    prepare_data(params)

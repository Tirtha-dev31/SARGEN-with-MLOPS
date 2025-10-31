"""
Test script to verify data loading
"""
import pandas as pd
from pathlib import Path

print("🔍 Testing data loading...")

# Test path
data_dir = Path(__file__).parent.parent / "data"
print(f"📂 Data directory: {data_dir}")
print(f"📂 Exists: {data_dir.exists()}")

# List files
if data_dir.exists():
    print("\n📄 Files in data directory:")
    for file in data_dir.iterdir():
        print(f"  - {file.name}")

# Try loading transactions
print("\n📊 Loading transactions...")
try:
    trans_file = data_dir / "HI-Small_Trans.csv"
    df = pd.read_csv(trans_file)
    print(f"✅ Loaded {len(df)} transactions")
    print(f"📋 Columns: {list(df.columns)}")
    print(f"\n🔍 Sample data:")
    print(df.head(2))
    
    # Check laundering column
    suspicious = df[df["Is Laundering"] == 1]
    print(f"\n🚨 Suspicious transactions: {len(suspicious)}")
    
except Exception as e:
    print(f"❌ Error: {e}")

# Try loading accounts
print("\n👥 Loading accounts...")
try:
    accounts_file = data_dir / "HI-Small_accounts.csv"
    df_acc = pd.read_csv(accounts_file)
    print(f"✅ Loaded {len(df_acc)} accounts")
    print(f"📋 Columns: {list(df_acc.columns)}")
    print(f"\n🔍 Sample data:")
    print(df_acc.head(2))
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ Data loading test complete!")

# Data Directory

## Required Data Files

This application requires the following data files to run:

1. **HI-Small_Trans.csv** - Transaction data (1M rows)
2. **HI-Small_accounts.csv** - Account data (518K rows)  
3. **HI-Small_Patterns.txt** - Known suspicious patterns (759 accounts)

## Data Source

These files are from the **IBM Transactions for Anti Money Laundering (AML)** dataset.

### Download Instructions:

1. Visit: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
2. Download the dataset
3. Extract the following files to this directory:
   - `HI-Small_Trans.csv`
   - `HI-Small_accounts.csv`
   - `HI-Small_Patterns.txt`

## Note

⚠️ **These data files are NOT included in the repository due to their size and sensitivity.**

After downloading, your `data/` folder structure should look like:
```
data/
├── README.md (this file)
├── HI-Small_Trans.csv
├── HI-Small_accounts.csv
└── HI-Small_Patterns.txt
```

"""
Simple SARGEN Backend - Optimized for Large Dataset
Samples data instead of loading everything
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
from pathlib import Path
import logging
import io
from datetime import datetime
try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✅ SUCCESS: Ollama module imported successfully!")
    logging.info("Ollama module imported successfully - AI features enabled")
except ImportError as e:
    OLLAMA_AVAILABLE = False
    print(f"❌ FAILED: Ollama import failed - {e}")
    logging.warning("Ollama not available - AI features will be disabled")

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.warning("ReportLab not available - PDF export will be disabled")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SARGEN Simple API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data storage
data = {
    "cases": [],
    "stats": {},
    "transactions": {},  # Store transactions per case
    "accounts": None,     # Store accounts dataframe
    "all_transactions": None  # Store all transactions
}

def parse_laundering_patterns(data_dir):
    """Parse the HI-Small_Patterns.txt file to identify pattern types"""
    patterns_file = data_dir / "HI-Small_Patterns.txt"
    patterns_info = {}
    
    try:
        with open(patterns_file, 'r') as f:
            lines = f.readlines()
            
        current_pattern = None
        current_transactions = []
        
        for line in lines:
            line = line.strip()
            if line.startswith("BEGIN LAUNDERING ATTEMPT"):
                # Extract pattern type
                if "FAN-OUT" in line:
                    current_pattern = "Fan-Out"
                elif "CYCLE" in line:
                    current_pattern = "Cycle"
                elif "GATHER-SCATTER" in line:
                    current_pattern = "Gather-Scatter"
                elif "STACK" in line:
                    current_pattern = "Stack"
                current_transactions = []
            elif line.startswith("END LAUNDERING ATTEMPT"):
                if current_pattern and current_transactions:
                    for txn_data in current_transactions:
                        account = txn_data.get("account")
                        if account:
                            if account not in patterns_info:
                                patterns_info[account] = set()
                            patterns_info[account].add(current_pattern)
                current_pattern = None
            elif current_pattern and "," in line and len(line) > 20:
                # Parse transaction line
                parts = line.split(",")
                if len(parts) >= 3:
                    from_account = parts[1] if len(parts) > 1 else None
                    to_account = parts[3] if len(parts) > 3 else None
                    if from_account:
                        current_transactions.append({"account": from_account})
                    if to_account:
                        current_transactions.append({"account": to_account})
        
        logger.info(f"✅ Parsed {len(patterns_info)} accounts with known patterns")
        return patterns_info
    except Exception as e:
        logger.warning(f"⚠️  Could not parse patterns file: {e}")
        return {}

def load_sample_data():
    """Load a sample of IBMS data for performance"""
    try:
        logger.info("📂 Loading IBMS data sample...")
        
        # Get data directory (app.py is in root, data is in root/data)
        data_dir = Path(__file__).parent / "data"
        logger.info(f"📂 Data path: {data_dir}")
        
        # Parse known laundering patterns
        logger.info("📖 Parsing known laundering patterns...")
        pattern_database = parse_laundering_patterns(data_dir)
        
        # Load more data to get diverse cases
        logger.info("Loading transactions sample...")
        transactions = pd.read_csv(
            data_dir / "HI-Small_Trans.csv",
            nrows=1000000  # Load 1M rows to find more suspicious cases with varied risk levels
        )
        logger.info(f"✅ Loaded {len(transactions)} transaction sample")
        
        # Load accounts
        logger.info("Loading accounts...")
        accounts = pd.read_csv(data_dir / "HI-Small_accounts.csv")
        logger.info(f"✅ Loaded {len(accounts)} accounts")
        
        # Filter suspicious transactions
        suspicious_txns = transactions[transactions["Is Laundering"] == 1]
        logger.info(f"🚨 Found {len(suspicious_txns)} suspicious transactions")
        
        # Store for later use
        data["accounts"] = accounts
        data["all_transactions"] = transactions
        
        # Create cases from suspicious accounts
        cases = []
        transactions_by_case = {}
        
        if len(suspicious_txns) > 0:
            # Group by account
            for idx, (account, txns) in enumerate(suspicious_txns.groupby("Account")):
                if idx >= 15:  # Limit to 15 cases for display
                    break
                
                case_id = f"SAR-2024-{idx+1:03d}"
                
                # Get account details
                account_info = accounts[accounts["Account Number"] == account]
                
                if len(account_info) == 0:
                    entity_name = "Unknown Entity"
                else:
                    entity_name = account_info.iloc[0]["Entity Name"]
                
                total_amount = float(txns["Amount Paid"].sum())
                txn_count = len(txns)
                
                # Determine risk level with more granular thresholds
                if total_amount > 100000 or txn_count > 20:
                    risk = "HIGH"
                elif total_amount > 30000 or txn_count > 8:
                    risk = "MEDIUM"
                else:
                    risk = "LOW"
                
                # Detect patterns - check pattern database first
                patterns = []
                if account in pattern_database:
                    patterns.extend(list(pattern_database[account]))
                
                # Add additional patterns based on transaction characteristics
                if txn_count > 10:
                    patterns.append("High Frequency")
                if total_amount > 50000:
                    patterns.append("Large Amount")
                if len(txns["To Bank"].unique()) > 5:
                    patterns.append("Multiple Recipients")
                
                if not patterns:
                    patterns = ["Suspicious Activity"]
                
                # Store transactions for this case
                transactions_by_case[case_id] = txns.to_dict('records')
                
                case = {
                    "case_id": case_id,
                    "customer": entity_name,
                    "account": account,
                    "risk_level": risk,
                    "patterns": patterns,
                    "amount": round(total_amount, 2),
                    "transaction_count": txn_count
                }
                cases.append(case)
        
        # If no suspicious transactions found, create sample cases
        if len(cases) == 0:
            logger.warning("⚠️  No suspicious transactions found, creating sample data...")
            cases = [
                {
                    "case_id": "SAR-2024-001",
                    "customer": "Sample Entity #1",
                    "account": "SAMPLE001",
                    "risk_level": "HIGH",
                    "patterns": ["Structuring", "Layering"],
                    "amount": 125000.50,
                    "transaction_count": 25
                },
                {
                    "case_id": "SAR-2024-002",
                    "customer": "Sample Entity #2",
                    "account": "SAMPLE002",
                    "risk_level": "MEDIUM",
                    "patterns": ["High Frequency"],
                    "amount": 45000.00,
                    "transaction_count": 12
                }
            ]
        
        data["cases"] = cases
        data["transactions"] = transactions_by_case
        
        # Calculate stats
        data["stats"] = {
            "total_cases": len(cases),
            "high_risk": len([c for c in cases if c["risk_level"] == "HIGH"]),
            "medium_risk": len([c for c in cases if c["risk_level"] == "MEDIUM"]),
            "low_risk": len([c for c in cases if c["risk_level"] == "LOW"]),
            "total_transactions": len(transactions),
            "network_nodes": len(accounts),
        }
        
        logger.info(f"✅ Generated {len(cases)} cases")
        logger.info(f"✅ Stats: {data['stats']}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error loading data: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.on_event("startup")
async def startup():
    """Initialize data on startup"""
    logger.info("🚀 Starting SARGEN Simple API...")
    success = load_sample_data()
    if success:
        logger.info("✅ SARGEN Simple API ready!")
    else:
        logger.error("❌ Failed to load data - using empty state")

@app.get("/")
def root():
    """Health check"""
    return {
        "status": "running",
        "message": "SARGEN Simple API - Real IBMS Data",
        "cases_loaded": len(data["cases"]),
        "version": "1.0.0"
    }

@app.get("/api/stats")
def get_stats():
    """Get dashboard statistics"""
    return data["stats"]

@app.get("/api/cases")
def get_cases():
    """Get all cases"""
    return {
        "cases": data["cases"],
        "total": len(data["cases"])
    }

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    """Get specific case details with all transactions"""
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if case:
        # Add transactions to response
        transactions = data["transactions"].get(case_id, [])
        return {
            **case,
            "transactions": transactions
        }
    return {"error": "Case not found"}, 404

@app.post("/api/cases/{case_id}/generate-sar")
def generate_sar(case_id: str):
    """Generate comprehensive SAR report for a case"""
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if not case:
        return {"error": "Case not found"}, 404
    
    transactions = data["transactions"].get(case_id, [])
    
    # Analyze transactions for detailed insights
    transaction_analysis = analyze_transactions(transactions)
    
    # Generate comprehensive SAR report
    sar_report = {
        "case_id": case_id,
        "filing_date": datetime.now().strftime("%Y-%m-%d"),
        "filing_institution": {
            "name": "Financial Intelligence Unit",
            "address": "AML Compliance Division",
            "contact": "compliance@fiu.gov"
        },
        "subject_information": {
            "name": case["customer"],
            "account_number": case["account"],
            "risk_level": case["risk_level"],
            "entity_type": extract_entity_type(case["customer"]),
            "identification": "Subject to investigation"
        },
        "suspicious_activity": {
            "activity_type": "Money Laundering",
            "patterns_detected": case["patterns"],
            "total_amount": case["amount"],
            "transaction_count": case["transaction_count"],
            "date_range": transaction_analysis["date_range"],
            "primary_concerns": generate_primary_concerns(case, transaction_analysis),
            "description": f"Suspicious activity detected involving {case['transaction_count']} transactions totaling ${case['amount']:,.2f}. "
                          f"Patterns identified: {', '.join(case['patterns'])}."
        },
        "transaction_analysis": transaction_analysis,
        "narrative": generate_sar_narrative(case, transactions, transaction_analysis),
        "supporting_documentation": {
            "transaction_records": len(transactions),
            "pattern_matches": len(case["patterns"]),
            "risk_indicators": calculate_risk_indicators(case, transaction_analysis)
        },
        "regulatory_information": {
            "regulatory_authority": "FinCEN",
            "report_type": "SAR-FinCEN Form",
            "priority": "High" if case["risk_level"] == "HIGH" else "Medium" if case["risk_level"] == "MEDIUM" else "Low",
            "follow_up_required": case["risk_level"] in ["HIGH", "MEDIUM"]
        },
        "recommendations": generate_recommendations(case, transaction_analysis),
        "transactions": transactions[:20],  # Include first 20 transactions
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "system_version": "SARGEN v1.0",
            "analyst": "Automated Detection System"
        }
    }
    
    return sar_report

def extract_entity_type(customer_name):
    """Extract entity type from customer name"""
    if "Corporation" in customer_name:
        return "Corporation"
    elif "Partnership" in customer_name:
        return "Partnership"
    elif "Sole Proprietorship" in customer_name:
        return "Sole Proprietorship"
    return "Individual"

def analyze_transactions(transactions):
    """Perform detailed analysis of transactions"""
    if not transactions:
        return {
            "date_range": {"start": "N/A", "end": "N/A"},
            "unique_banks": {"sending": 0, "receiving": 0},
            "currencies": [],
            "amount_statistics": {},
            "time_patterns": {},
            "geographic_spread": {}
        }
    
    df = pd.DataFrame(transactions)
    
    # Date range
    date_range = {
        "start": "N/A",
        "end": "N/A"
    }
    if 'Timestamp' in df.columns:
        try:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            date_range = {
                "start": df['Timestamp'].min().strftime("%Y-%m-%d"),
                "end": df['Timestamp'].max().strftime("%Y-%m-%d")
            }
        except:
            pass
    
    # Bank analysis
    unique_banks = {
        "sending": df['From Bank'].nunique() if 'From Bank' in df.columns else 0,
        "receiving": df['To Bank'].nunique() if 'To Bank' in df.columns else 0,
        "total_unique": len(set(list(df.get('From Bank', [])) + list(df.get('To Bank', []))))
    }
    
    # Currency analysis
    currencies = []
    if 'Receiving Currency' in df.columns:
        currencies = df['Receiving Currency'].value_counts().head(5).to_dict()
    
    # Amount statistics
    amount_stats = {}
    if 'Amount Paid' in df.columns:
        amount_stats = {
            "minimum": float(df['Amount Paid'].min()),
            "maximum": float(df['Amount Paid'].max()),
            "average": float(df['Amount Paid'].mean()),
            "median": float(df['Amount Paid'].median()),
            "total": float(df['Amount Paid'].sum()),
            "std_deviation": float(df['Amount Paid'].std())
        }
    
    # Time patterns (if timestamps available)
    time_patterns = {}
    if 'Timestamp' in df.columns:
        try:
            df['hour'] = df['Timestamp'].dt.hour
            df['day_of_week'] = df['Timestamp'].dt.dayofweek
            time_patterns = {
                "peak_hours": df['hour'].value_counts().head(3).to_dict(),
                "peak_days": df['day_of_week'].value_counts().head(3).to_dict(),
                "unusual_hours": sum((df['hour'] < 6) | (df['hour'] > 22))
            }
        except:
            pass
    
    return {
        "date_range": date_range,
        "unique_banks": unique_banks,
        "currencies": currencies,
        "amount_statistics": amount_stats,
        "time_patterns": time_patterns,
        "transaction_velocity": {
            "total": len(transactions),
            "average_per_day": len(transactions) / 30 if len(transactions) > 0 else 0  # Assuming 30-day period
        }
    }

def generate_primary_concerns(case, transaction_analysis):
    """Generate list of primary concerns based on patterns and analysis"""
    concerns = []
    
    if case["risk_level"] == "HIGH":
        concerns.append("High-risk designation due to significant transaction volume and/or amount")
    
    if "Large Amount" in case["patterns"]:
        concerns.append("Unusually large transaction amounts exceeding typical customer profile")
    
    if "High Frequency" in case["patterns"]:
        concerns.append("Abnormally high transaction frequency indicating potential structuring")
    
    if "Multiple Recipients" in case["patterns"]:
        concerns.append("Multiple beneficiaries suggesting possible layering or integration activities")
    
    if transaction_analysis.get("unique_banks", {}).get("total_unique", 0) > 10:
        concerns.append(f"Extensive banking network involving {transaction_analysis['unique_banks']['total_unique']} different institutions")
    
    if transaction_analysis.get("time_patterns", {}).get("unusual_hours", 0) > 5:
        concerns.append("Significant number of transactions conducted during unusual hours")
    
    if len(transaction_analysis.get("currencies", {})) > 3:
        concerns.append("Multi-currency transactions increasing complexity and tracing difficulty")
    
    return concerns

def calculate_risk_indicators(case, transaction_analysis):
    """Calculate numerical risk indicators"""
    indicators = []
    
    amount_stats = transaction_analysis.get("amount_statistics", {})
    
    indicators.append({
        "indicator": "Transaction Volume",
        "value": case["transaction_count"],
        "threshold": 10,
        "severity": "High" if case["transaction_count"] > 20 else "Medium" if case["transaction_count"] > 10 else "Low"
    })
    
    indicators.append({
        "indicator": "Total Amount",
        "value": f"${case['amount']:,.2f}",
        "threshold": "$100,000",
        "severity": "High" if case["amount"] > 100000 else "Medium" if case["amount"] > 30000 else "Low"
    })
    
    indicators.append({
        "indicator": "Banking Network Complexity",
        "value": transaction_analysis.get("unique_banks", {}).get("total_unique", 0),
        "threshold": 10,
        "severity": "High" if transaction_analysis.get("unique_banks", {}).get("total_unique", 0) > 15 else "Medium"
    })
    
    indicators.append({
        "indicator": "Pattern Matches",
        "value": len(case["patterns"]),
        "threshold": 2,
        "severity": "High" if len(case["patterns"]) > 3 else "Medium" if len(case["patterns"]) > 1 else "Low"
    })
    
    return indicators

def generate_recommendations(case, transaction_analysis):
    """Generate actionable recommendations"""
    recommendations = []
    
    if case["risk_level"] == "HIGH":
        recommendations.append({
            "priority": "Immediate",
            "action": "Escalate to senior compliance officer for immediate review",
            "rationale": "High-risk designation requires urgent attention and potential law enforcement notification"
        })
        recommendations.append({
            "priority": "Immediate",
            "action": "Consider filing with FinCEN within 30 days",
            "rationale": "Regulatory requirement for suspicious activity of this magnitude"
        })
    
    recommendations.append({
        "priority": "High",
        "action": "Conduct enhanced due diligence on subject",
        "rationale": f"Verify identity, business activities, and source of funds for {case['customer']}"
    })
    
    recommendations.append({
        "priority": "High",
        "action": "Review all related accounts and entities",
        "rationale": "Identify potential connected parties and expand investigation scope"
    })
    
    if transaction_analysis.get("unique_banks", {}).get("total_unique", 0) > 10:
        recommendations.append({
            "priority": "Medium",
            "action": "Request transaction records from correspondent banks",
            "rationale": "Large banking network requires comprehensive transaction trail analysis"
        })
    
    recommendations.append({
        "priority": "Medium",
        "action": "Monitor account for 90 days post-filing",
        "rationale": "Continued monitoring required to detect ongoing suspicious activity"
    })
    
    if case["risk_level"] in ["HIGH", "MEDIUM"]:
        recommendations.append({
            "priority": "Low",
            "action": "Consider account restrictions or closure",
            "rationale": "Risk mitigation may require limiting or terminating banking relationship"
        })
    
    return recommendations

def generate_sar_narrative(case, transactions, transaction_analysis):
    """Generate comprehensive narrative for SAR report"""
    
    entity_type = extract_entity_type(case['customer'])
    amount_stats = transaction_analysis.get("amount_statistics", {})
    date_range = transaction_analysis.get("date_range", {})
    unique_banks = transaction_analysis.get("unique_banks", {})
    
    narrative = f"""
SUSPICIOUS ACTIVITY REPORT (SAR)
═══════════════════════════════════════════════════════════════

CASE IDENTIFICATION: {case['case_id']}
FILING DATE: {datetime.now().strftime("%B %d, %Y")}
RISK CLASSIFICATION: {case['risk_level']}

═══════════════════════════════════════════════════════════════
I. SUBJECT INFORMATION
═══════════════════════════════════════════════════════════════

Subject Name: {case['customer']}
Account Number: {case['account']}
Entity Type: {entity_type}
Risk Assessment: {case['risk_level']} RISK

═══════════════════════════════════════════════════════════════
II. EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

This Suspicious Activity Report documents financial transactions conducted by {case['customer']} 
that exhibit characteristics consistent with money laundering and other financial crimes. The 
automated monitoring system identified {case['transaction_count']} suspicious transactions 
totaling ${case['amount']:,.2f} over the period from {date_range.get('start', 'N/A')} to 
{date_range.get('end', 'N/A')}.

The activity has been classified as {case['risk_level']} RISK based on multiple risk indicators 
including transaction patterns, volume, and amounts. Immediate regulatory reporting and 
investigation are recommended.

═══════════════════════════════════════════════════════════════
III. SUSPICIOUS ACTIVITY DESCRIPTION
═══════════════════════════════════════════════════════════════

A. Pattern Analysis

The following suspicious patterns were identified through automated detection algorithms:
"""
    
    for i, pattern in enumerate(case['patterns'], 1):
        narrative += f"\n{i}. {pattern.upper()}"
        
        # Add pattern-specific descriptions
        if "Large Amount" in pattern:
            narrative += f"\n   - Individual transactions significantly exceed typical customer profile"
            if amount_stats.get("maximum"):
                narrative += f"\n   - Maximum single transaction: ${amount_stats['maximum']:,.2f}"
        
        elif "High Frequency" in pattern:
            narrative += f"\n   - Transaction frequency indicates potential structuring to avoid reporting thresholds"
            narrative += f"\n   - Average transactions per day: {transaction_analysis.get('transaction_velocity', {}).get('average_per_day', 0):.1f}"
        
        elif "Multiple Recipients" in pattern:
            narrative += f"\n   - Funds distributed across multiple beneficiaries suggesting layering activities"
            narrative += f"\n   - Unique receiving banks: {unique_banks.get('receiving', 0)}"
        
        elif "Fan-Out" in pattern or "Gather-Scatter" in pattern:
            narrative += f"\n   - Known money laundering pattern involving rapid fund dispersion"
            narrative += f"\n   - Banking network complexity: {unique_banks.get('total_unique', 0)} institutions"
        
        elif "Cycle" in pattern:
            narrative += f"\n   - Circular transaction patterns designed to obscure fund origins"
        
        elif "Stack" in pattern:
            narrative += f"\n   - Sequential layered transactions indicating sophisticated laundering scheme"
    
    narrative += f"""

B. Transaction Characteristics

Transaction Volume: {case['transaction_count']} suspicious transactions identified
Total Amount: ${case['amount']:,.2f}"""
    
    if amount_stats:
        narrative += f"""
Average Transaction: ${amount_stats.get('average', 0):,.2f}
Median Transaction: ${amount_stats.get('median', 0):,.2f}
Smallest Transaction: ${amount_stats.get('minimum', 0):,.2f}
Largest Transaction: ${amount_stats.get('maximum', 0):,.2f}
Standard Deviation: ${amount_stats.get('std_deviation', 0):,.2f}"""
    
    narrative += f"""

C. Banking Network Analysis

Originating Banks: {unique_banks.get('sending', 0)} unique institutions
Receiving Banks: {unique_banks.get('receiving', 0)} unique institutions
Total Network Size: {unique_banks.get('total_unique', 0)} banking entities

The extensive banking network suggests deliberate attempts to complicate transaction 
tracing and avoid detection through geographic and institutional diversification.
"""
    
    # Currency analysis
    currencies = transaction_analysis.get("currencies", {})
    if currencies:
        narrative += f"""

D. Currency Analysis

Multiple currencies detected in transaction flow:"""
        for curr, count in list(currencies.items())[:5]:
            narrative += f"\n- {curr}: {count} transactions"
        
        narrative += f"\n\nMulti-currency transactions increase complexity and may indicate international money laundering schemes."
    
    # Time patterns
    time_patterns = transaction_analysis.get("time_patterns", {})
    if time_patterns.get("unusual_hours", 0) > 0:
        narrative += f"""

E. Temporal Analysis

Unusual Hours: {time_patterns['unusual_hours']} transactions occurred outside normal business hours (10 PM - 6 AM)

Transactions conducted during unusual hours may indicate attempts to avoid detection 
or exploit limited oversight during non-business periods."""
    
    narrative += f"""

═══════════════════════════════════════════════════════════════
IV. REGULATORY COMPLIANCE ASSESSMENT
═══════════════════════════════════════════════════════════════

Risk Indicators Present:
- Transaction structuring patterns detected: YES
- Amounts exceed regulatory thresholds: {'YES' if case['amount'] > 10000 else 'NO'}
- Multiple jurisdictions involved: {'YES' if unique_banks.get('total_unique', 0) > 5 else 'NO'}
- Unusual transaction timing: {'YES' if time_patterns.get('unusual_hours', 0) > 5 else 'NO'}
- Complex banking network: {'YES' if unique_banks.get('total_unique', 0) > 10 else 'NO'}

Regulatory Thresholds:
- Bank Secrecy Act (BSA) reporting: TRIGGERED
- FinCEN SAR filing requirement: {'IMMEDIATE' if case['risk_level'] == 'HIGH' else 'REQUIRED'}
- Enhanced Due Diligence: REQUIRED

═══════════════════════════════════════════════════════════════
V. INVESTIGATIVE FINDINGS
═══════════════════════════════════════════════════════════════

Based on comprehensive analysis of {case['transaction_count']} transactions involving 
${case['amount']:,.2f}, the following conclusions are drawn:

1. MONEY LAUNDERING RISK: {'SEVERE' if case['risk_level'] == 'HIGH' else 'ELEVATED' if case['risk_level'] == 'MEDIUM' else 'MODERATE'}
   
   The transaction patterns, volumes, and network complexity strongly suggest deliberate 
   money laundering activities. The detected patterns ({', '.join(case['patterns'])}) are 
   consistent with known laundering methodologies documented in financial crime databases.

2. REGULATORY ACTION: {'URGENT' if case['risk_level'] == 'HIGH' else 'RECOMMENDED'}
   
   {'Immediate escalation to senior compliance and potential law enforcement notification required.' 
    if case['risk_level'] == 'HIGH' else 
    'Standard regulatory reporting procedures should be followed with heightened monitoring.'}

3. CUSTOMER RELATIONSHIP: UNDER REVIEW
   
   {'Enhanced due diligence and potential account restrictions or closure recommended.' 
    if case['risk_level'] in ['HIGH', 'MEDIUM'] else 
    'Continued monitoring with periodic review of account activity.'}

═══════════════════════════════════════════════════════════════
VI. RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

IMMEDIATE ACTIONS (0-5 days):
"""
    
    if case['risk_level'] == 'HIGH':
        narrative += """
1. File SAR with FinCEN within 30 days of initial detection
2. Escalate to senior compliance officer and legal counsel
3. Notify law enforcement if criminal activity is suspected
4. Implement enhanced monitoring on all related accounts
5. Consider freezing account pending investigation"""
    else:
        narrative += """
1. Complete enhanced due diligence review
2. File SAR with FinCEN per standard timeline
3. Request additional customer documentation
4. Review all related accounts and entities"""
    
    narrative += """

SHORT-TERM ACTIONS (5-30 days):
1. Conduct comprehensive investigation of subject's financial activities
2. Review historical transactions for additional suspicious patterns
3. Identify and investigate related parties and entities
4. Request information from correspondent banks
5. Document all investigative steps and findings

LONG-TERM ACTIONS (30-90 days):
1. Implement ongoing enhanced monitoring (90-day minimum)
2. Conduct periodic reviews of account activity
3. Update customer risk profile based on investigation findings
4. Consider account relationship continuation or termination
5. Maintain detailed documentation for regulatory examination

═══════════════════════════════════════════════════════════════
VII. SUPPORTING DOCUMENTATION
═══════════════════════════════════════════════════════════════

Attached Documents:
- Transaction records ({len(transactions)} transactions)
- Pattern detection algorithm outputs
- Network analysis diagrams
- Risk scoring calculations
- Compliance review notes

═══════════════════════════════════════════════════════════════
VIII. DECLARATION
═══════════════════════════════════════════════════════════════

This Suspicious Activity Report has been prepared in accordance with the Bank Secrecy Act 
and FinCEN regulations. The information contained herein is based on automated detection 
systems, transaction analysis, and compliance review procedures.

Report Prepared By: SARGEN Automated Detection System v1.0
Report Generated: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}
Compliance Authority: Financial Intelligence Unit - AML Division

═══════════════════════════════════════════════════════════════
END OF REPORT
═══════════════════════════════════════════════════════════════
"""
    
    return narrative.strip()

@app.get("/api/export/sar-pdf/{case_id}")
def export_sar_pdf(case_id: str):
    """Export SAR report as PDF"""
    if not REPORTLAB_AVAILABLE:
        return {"error": "PDF export not available - ReportLab not installed"}
    
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if not case:
        return {"error": "Case not found"}, 404
    
    transactions = data["transactions"].get(case_id, [])
    transaction_analysis = analyze_transactions(transactions)
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Container for PDF elements
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=20,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
        leftIndent=0
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=14
    )
    
    # Title
    elements.append(Paragraph("SUSPICIOUS ACTIVITY REPORT (SAR)", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Case Information Box
    case_data = [
        ["Case ID:", case_id],
        ["Filing Date:", datetime.now().strftime("%B %d, %Y")],
        ["Risk Level:", case['risk_level']],
        ["Subject:", case['customer']],
        ["Account:", case['account']]
    ]
    
    case_table = Table(case_data, colWidths=[2*inch, 4*inch])
    case_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0e7ff')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(case_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Executive Summary
    elements.append(Paragraph("I. EXECUTIVE SUMMARY", heading_style))
    summary_text = f"""This Suspicious Activity Report documents {case['transaction_count']} suspicious 
    transactions totaling ${case['amount']:,.2f} involving {case['customer']}. The activity has been 
    classified as {case['risk_level']} RISK based on multiple indicators including transaction patterns, 
    volume, and amounts."""
    elements.append(Paragraph(summary_text, normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Suspicious Patterns
    elements.append(Paragraph("II. DETECTED PATTERNS", heading_style))
    for i, pattern in enumerate(case['patterns'], 1):
        elements.append(Paragraph(f"{i}. {pattern}", normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Transaction Statistics
    elements.append(Paragraph("III. TRANSACTION ANALYSIS", heading_style))
    amount_stats = transaction_analysis.get("amount_statistics", {})
    
    stats_data = [
        ["Metric", "Value"],
        ["Total Transactions", str(case['transaction_count'])],
        ["Total Amount", f"${case['amount']:,.2f}"],
    ]
    
    if amount_stats:
        stats_data.extend([
            ["Average Amount", f"${amount_stats.get('average', 0):,.2f}"],
            ["Median Amount", f"${amount_stats.get('median', 0):,.2f}"],
            ["Maximum Amount", f"${amount_stats.get('maximum', 0):,.2f}"],
            ["Minimum Amount", f"${amount_stats.get('minimum', 0):,.2f}"]
        ])
    
    stats_table = Table(stats_data, colWidths=[3*inch, 3*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Banking Network
    unique_banks = transaction_analysis.get("unique_banks", {})
    elements.append(Paragraph("IV. BANKING NETWORK", heading_style))
    bank_text = f"""The suspicious activity involves {unique_banks.get('total_unique', 0)} unique banking 
    institutions, including {unique_banks.get('sending', 0)} originating banks and 
    {unique_banks.get('receiving', 0)} receiving banks. This extensive network suggests deliberate 
    attempts to complicate transaction tracing."""
    elements.append(Paragraph(bank_text, normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Primary Concerns
    elements.append(Paragraph("V. PRIMARY CONCERNS", heading_style))
    concerns = generate_primary_concerns(case, transaction_analysis)
    for i, concern in enumerate(concerns, 1):
        elements.append(Paragraph(f"{i}. {concern}", normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Risk Indicators
    elements.append(Paragraph("VI. RISK INDICATORS", heading_style))
    indicators = calculate_risk_indicators(case, transaction_analysis)
    
    risk_data = [["Indicator", "Value", "Threshold", "Severity"]]
    for ind in indicators:
        risk_data.append([
            ind['indicator'],
            str(ind['value']),
            str(ind['threshold']),
            ind['severity']
        ])
    
    risk_table = Table(risk_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(risk_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Page Break before recommendations
    elements.append(PageBreak())
    
    # Recommendations
    elements.append(Paragraph("VII. RECOMMENDATIONS", heading_style))
    recommendations = generate_recommendations(case, transaction_analysis)
    
    for rec in recommendations:
        priority_color = colors.red if rec['priority'] == 'Immediate' else colors.orange if rec['priority'] == 'High' else colors.blue
        priority_text = f"<font color='{priority_color.hexval()}'><b>[{rec['priority']}]</b></font> {rec['action']}"
        elements.append(Paragraph(priority_text, normal_style))
        elements.append(Paragraph(f"<i>Rationale: {rec['rationale']}</i>", normal_style))
        elements.append(Spacer(1, 0.1*inch))
    
    # Sample Transactions
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("VIII. SAMPLE TRANSACTIONS", heading_style))
    
    if transactions:
        txn_data = [["Date", "From Bank", "To Bank", "Amount", "Currency"]]
        for txn in transactions[:10]:  # First 10 transactions
            txn_data.append([
                str(txn.get('Timestamp', 'N/A'))[:10],
                str(txn.get('From Bank', 'N/A'))[:15],
                str(txn.get('To Bank', 'N/A'))[:15],
                f"${float(txn.get('Amount Paid', 0)):,.2f}",
                str(txn.get('Receiving Currency', 'USD'))
            ])
        
        txn_table = Table(txn_data, colWidths=[1.2*inch, 1.5*inch, 1.5*inch, 1.2*inch, 0.8*inch])
        txn_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(txn_table)
    
    # Declaration
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("IX. DECLARATION", heading_style))
    declaration = f"""This Suspicious Activity Report has been prepared in accordance with the Bank Secrecy Act 
    and FinCEN regulations. The information contained herein is based on automated detection systems and 
    compliance review procedures.<br/><br/>
    <b>Report Generated:</b> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}<br/>
    <b>System:</b> SARGEN Automated Detection System v1.0<br/>
    <b>Authority:</b> Financial Intelligence Unit - AML Division"""
    elements.append(Paragraph(declaration, normal_style))
    
    # Build PDF
    doc.build(elements)
    
    # Return PDF
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SAR_{case_id}_{datetime.now().strftime('%Y%m%d')}.pdf"}
    )

@app.get("/api/network/{case_id}")
def get_network_data(case_id: str):
    """Get network graph data for a case"""
    transactions = data["transactions"].get(case_id, [])
    
    if not transactions:
        return {"nodes": [], "edges": []}
    
    nodes = {}
    edges = []
    
    for txn in transactions:
        from_bank = txn.get("From Bank", "Unknown")
        to_bank = txn.get("To Bank", "Unknown")
        amount = float(txn.get("Amount Paid", 0))
        
        # Add nodes
        if from_bank not in nodes:
            nodes[from_bank] = {"id": from_bank, "label": from_bank, "type": "bank"}
        if to_bank not in nodes:
            nodes[to_bank] = {"id": to_bank, "label": to_bank, "type": "bank"}
        
        # Add edge
        edges.append({
            "from": from_bank,
            "to": to_bank,
            "amount": amount,
            "currency": txn.get("Receiving Currency", "USD")
        })
    
    return {
        "nodes": list(nodes.values()),
        "edges": edges
    }

@app.get("/api/export/excel/{case_id}")
def export_case_excel(case_id: str):
    """Export case data to Excel"""
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if not case:
        return {"error": "Case not found"}, 404
    
    transactions = data["transactions"].get(case_id, [])
    
    # Create Excel file in memory
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Case summary sheet
        case_df = pd.DataFrame([{
            "Case ID": case["case_id"],
            "Customer": case["customer"],
            "Account": case["account"],
            "Risk Level": case["risk_level"],
            "Total Amount": case["amount"],
            "Transaction Count": case["transaction_count"],
            "Patterns": ", ".join(case["patterns"])
        }])
        case_df.to_excel(writer, sheet_name='Case Summary', index=False)
        
        # Transactions sheet
        if transactions:
            txn_df = pd.DataFrame(transactions)
            txn_df.to_excel(writer, sheet_name='Transactions', index=False)
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': f'attachment; filename="{case_id}_export.xlsx"'
        }
    )

@app.get("/api/export/all-cases/excel")
def export_all_cases_excel():
    """Export all cases to Excel"""
    output = io.BytesIO()
    
    # Convert cases to DataFrame
    cases_df = pd.DataFrame(data["cases"])
    if "patterns" in cases_df.columns:
        cases_df["patterns"] = cases_df["patterns"].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        cases_df.to_excel(writer, sheet_name='All Cases', index=False)
    
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': f'attachment; filename="all_cases_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
        }
    )

@app.post("/api/cases/{case_id}/status")
def update_case_status(case_id: str, status: dict):
    """Update case status"""
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if not case:
        return {"error": "Case not found"}, 404
    
    # Update case status
    if "status" in status:
        case["status"] = status["status"]
    if "assigned_to" in status:
        case["assigned_to"] = status["assigned_to"]
    if "notes" in status:
        if "notes" not in case:
            case["notes"] = []
        case["notes"].append({
            "text": status["notes"],
            "timestamp": datetime.now().isoformat()
        })
    
    return case

@app.post("/api/ai/generate-narrative/{case_id}")
def generate_ai_narrative(case_id: str, model: str = "llama3.2"):
    """Generate AI-powered SAR narrative using Ollama"""
    if not OLLAMA_AVAILABLE:
        return {"error": "Ollama is not installed", "message": "Please install Ollama from https://ollama.ai"}
    
    case = next((c for c in data["cases"] if c["case_id"] == case_id), None)
    if not case:
        return {"error": "Case not found"}, 404
    
    transactions = data["transactions"].get(case_id, [])
    
    # Create prompt for Ollama
    prompt = f"""You are a financial compliance expert writing a Suspicious Activity Report (SAR).

Case Details:
- Case ID: {case["case_id"]}
- Customer: {case["customer"]}
- Account: {case["account"]}
- Risk Level: {case["risk_level"]}
- Total Amount: ${case["amount"]:,.2f}
- Transaction Count: {case["transaction_count"]}
- Detected Patterns: {", ".join(case["patterns"])}

Sample Transactions (first 3):
"""
    
    for i, txn in enumerate(transactions[:3]):
        prompt += f"\n{i+1}. {txn.get('Timestamp', 'N/A')} - ${txn.get('Amount Paid', 0):,.2f} from {txn.get('From Bank', 'Unknown')} to {txn.get('To Bank', 'Unknown')}"
    
    prompt += "\n\nGenerate a professional SAR narrative (200-300 words) describing the suspicious activity, patterns identified, and why this warrants investigation. Use formal regulatory language."
    
    try:
        response = ollama.generate(model=model, prompt=prompt)
        return {
            "narrative": response['response'],
            "model": model
        }
    except Exception as e:
        return {"error": str(e), "message": "Make sure Ollama is running and the model is installed"}

@app.get("/api/health")
def health_check():
    """Health check endpoint to verify system status"""
    return {
        "status": "healthy",
        "ollama_available": OLLAMA_AVAILABLE,
        "reportlab_available": REPORTLAB_AVAILABLE,
        "cases_loaded": len(data.get("cases", [])),
        "stats": data.get("stats", {})
    }

@app.post("/api/ai/chat")
def ai_chat(question: dict):
    """AI chat interface for asking questions about cases"""
    logger.info(f"AI Chat request received. OLLAMA_AVAILABLE={OLLAMA_AVAILABLE}")
    logger.info(f"Question data: {question}")
    
    if not OLLAMA_AVAILABLE:
        logger.error("Ollama is not available - returning error")
        return {"error": "Ollama is not installed"}
    
    user_question = question.get("question", "")
    model = question.get("model", "llama3.2")
    logger.info(f"Processing question: {user_question} with model: {model}")
    
    # Create minimal context - only include relevant info
    prompt = f"""You are a financial compliance AI assistant. Answer based on these statistics:

Total Cases: {data['stats'].get('total_cases', 0)} (High Risk: {data['stats'].get('high_risk', 0)}, Medium: {data['stats'].get('medium_risk', 0)}, Low: {data['stats'].get('low_risk', 0)})

Question: {user_question}

Provide a brief, direct answer (2-3 sentences max)."""
    
    # Only add detailed case info if specifically asked about cases
    if any(keyword in user_question.lower() for keyword in ['case', 'sar-', 'list', 'show me', 'which']):
        cases_summary = ""
        for case in data["cases"][:8]:  # Reduced from 10 to 8
            cases_summary += f"{case['case_id']}: {case['customer']}, {case['risk_level']}, ${case['amount']:,.2f}, {', '.join(case['patterns'][:2])}\n"
        prompt = f"""Financial compliance AI assistant.

Cases:
{cases_summary}

Stats: {data['stats'].get('total_cases', 0)} total ({data['stats'].get('high_risk', 0)} high risk)

Question: {user_question}

Answer briefly:"""
    
    try:
        response = ollama.generate(model=model, prompt=prompt)
        return {
            "response": response['response'],
            "model": model
        }
    except Exception as e:
        return {"error": str(e), "response": f"Error: {str(e)}"}

@app.get("/api/analytics/kpis")
def get_analytics_kpis():
    """Calculate comprehensive KPIs for analytics dashboard"""
    cases = data["cases"]
    all_txns = data["all_transactions"]
    
    if not cases:
        return {"error": "No data loaded"}
    
    # Basic counts
    total_cases = len(cases)
    high_risk = sum(1 for c in cases if c["risk_level"] == "HIGH")
    medium_risk = sum(1 for c in cases if c["risk_level"] == "MEDIUM")
    low_risk = sum(1 for c in cases if c["risk_level"] == "LOW")
    
    # Amount analytics
    total_amount = sum(c["amount"] for c in cases)
    avg_amount = total_amount / total_cases if total_cases > 0 else 0
    max_amount = max(c["amount"] for c in cases) if cases else 0
    
    # Transaction analytics
    total_transactions = sum(c["transaction_count"] for c in cases)
    avg_txns_per_case = total_transactions / total_cases if total_cases > 0 else 0
    
    # Pattern analytics
    all_patterns = {}
    for case in cases:
        for pattern in case.get("patterns", []):
            all_patterns[pattern] = all_patterns.get(pattern, 0) + 1
    
    # Risk distribution by amount ranges
    amount_ranges = {
        "0-10K": 0,
        "10K-50K": 0,
        "50K-100K": 0,
        "100K-500K": 0,
        "500K+": 0
    }
    for case in cases:
        amt = case["amount"]
        if amt < 10000:
            amount_ranges["0-10K"] += 1
        elif amt < 50000:
            amount_ranges["10K-50K"] += 1
        elif amt < 100000:
            amount_ranges["50K-100K"] += 1
        elif amt < 500000:
            amount_ranges["100K-500K"] += 1
        else:
            amount_ranges["500K+"] += 1
    
    # Case velocity (cases per risk level with avg amount)
    risk_breakdown = {
        "HIGH": {
            "count": high_risk,
            "total_amount": sum(c["amount"] for c in cases if c["risk_level"] == "HIGH"),
            "avg_amount": sum(c["amount"] for c in cases if c["risk_level"] == "HIGH") / high_risk if high_risk > 0 else 0,
            "avg_transactions": sum(c["transaction_count"] for c in cases if c["risk_level"] == "HIGH") / high_risk if high_risk > 0 else 0
        },
        "MEDIUM": {
            "count": medium_risk,
            "total_amount": sum(c["amount"] for c in cases if c["risk_level"] == "MEDIUM"),
            "avg_amount": sum(c["amount"] for c in cases if c["risk_level"] == "MEDIUM") / medium_risk if medium_risk > 0 else 0,
            "avg_transactions": sum(c["transaction_count"] for c in cases if c["risk_level"] == "MEDIUM") / medium_risk if medium_risk > 0 else 0
        },
        "LOW": {
            "count": low_risk,
            "total_amount": sum(c["amount"] for c in cases if c["risk_level"] == "LOW"),
            "avg_amount": sum(c["amount"] for c in cases if c["risk_level"] == "LOW") / low_risk if low_risk > 0 else 0,
            "avg_transactions": sum(c["transaction_count"] for c in cases if c["risk_level"] == "LOW") / low_risk if low_risk > 0 else 0
        }
    }
    
    # Top accounts by amount
    top_accounts = sorted(cases, key=lambda x: x["amount"], reverse=True)[:10]
    top_accounts_data = [
        {
            "account": c["account"],
            "customer": c["customer"],
            "amount": c["amount"],
            "risk": c["risk_level"]
        }
        for c in top_accounts
    ]
    
    # Detection rate (suspicious vs total transactions)
    suspicious_txns = sum(c["transaction_count"] for c in cases)
    total_sample_txns = len(all_txns) if all_txns is not None else 0
    detection_rate = (suspicious_txns / total_sample_txns * 100) if total_sample_txns > 0 else 0
    
    # Case complexity (avg patterns per case)
    avg_patterns = sum(len(c.get("patterns", [])) for c in cases) / total_cases if total_cases > 0 else 0
    
    # Additional Analytics with Transaction Data
    temporal_analysis = {}
    bank_analysis = {}
    currency_analysis = {}
    account_type_analysis = {}
    
    if all_txns is not None and not all_txns.empty:
        # Temporal Analysis - Transaction volume over time
        suspicious_df = all_txns[all_txns["Is Laundering"] == 1].copy()
        if not suspicious_df.empty and 'Timestamp' in suspicious_df.columns:
            try:
                suspicious_df['Timestamp'] = pd.to_datetime(suspicious_df['Timestamp'])
                suspicious_df['Date'] = suspicious_df['Timestamp'].dt.date
                daily_counts = suspicious_df.groupby('Date').size()
                
                # Get last 30 days or all available days
                temporal_data = []
                for date, count in daily_counts.items():
                    temporal_data.append({
                        "date": str(date),
                        "count": int(count),
                        "amount": float(suspicious_df[suspicious_df['Date'] == date]['Amount Paid'].sum())
                    })
                temporal_analysis = {
                    "daily_trends": sorted(temporal_data, key=lambda x: x['date'])[-30:],  # Last 30 days
                    "peak_day": max(temporal_data, key=lambda x: x['count']) if temporal_data else None,
                    "total_days": len(temporal_data)
                }
            except Exception as e:
                logger.warning(f"Could not parse temporal data: {e}")
        
        # Bank Network Analysis
        if 'From Bank' in all_txns.columns and 'To Bank' in all_txns.columns:
            from_banks = suspicious_df['From Bank'].value_counts().head(10)
            to_banks = suspicious_df['To Bank'].value_counts().head(10)
            
            bank_analysis = {
                "top_sending_banks": [
                    {"bank": str(bank), "count": int(count)} 
                    for bank, count in from_banks.items()
                ],
                "top_receiving_banks": [
                    {"bank": str(bank), "count": int(count)} 
                    for bank, count in to_banks.items()
                ],
                "unique_banks": len(set(list(suspicious_df['From Bank'].unique()) + list(suspicious_df['To Bank'].unique())))
            }
        
        # Currency Analysis
        if 'Receiving Currency' in all_txns.columns:
            currency_counts = suspicious_df['Receiving Currency'].value_counts()
            currency_analysis = {
                "distribution": [
                    {"currency": str(curr), "count": int(count), "percentage": float(count / len(suspicious_df) * 100)}
                    for curr, count in currency_counts.items()
                ],
                "unique_currencies": len(currency_counts)
            }
        
        # Transaction Amount Statistics
        amount_stats = {
            "min": float(suspicious_df['Amount Paid'].min()) if 'Amount Paid' in suspicious_df.columns else 0,
            "max": float(suspicious_df['Amount Paid'].max()) if 'Amount Paid' in suspicious_df.columns else 0,
            "median": float(suspicious_df['Amount Paid'].median()) if 'Amount Paid' in suspicious_df.columns else 0,
            "std_dev": float(suspicious_df['Amount Paid'].std()) if 'Amount Paid' in suspicious_df.columns else 0,
            "total": float(suspicious_df['Amount Paid'].sum()) if 'Amount Paid' in suspicious_df.columns else 0
        }
        
        # Account Type Analysis (from customer names)
        account_types = {"Corporation": 0, "Partnership": 0, "Sole Proprietorship": 0, "Unknown": 0}
        for case in cases:
            customer = case.get("customer", "")
            if "Corporation" in customer:
                account_types["Corporation"] += 1
            elif "Partnership" in customer:
                account_types["Partnership"] += 1
            elif "Sole Proprietorship" in customer:
                account_types["Sole Proprietorship"] += 1
            else:
                account_types["Unknown"] += 1
        
        account_type_analysis = {
            "distribution": [
                {"type": k, "count": v, "percentage": float(v / total_cases * 100) if total_cases > 0 else 0}
                for k, v in account_types.items() if v > 0
            ]
        }
    
    # Investigation Metrics (simulated)
    investigation_metrics = {
        "avg_investigation_time_days": 15.5,  # Placeholder
        "case_closure_rate": (0 / total_cases * 100) if total_cases > 0 else 0,  # Placeholder - no closed cases yet
        "escalation_rate": (high_risk / total_cases * 100) if total_cases > 0 else 0,
        "false_positive_rate": 5.2,  # Placeholder
        "true_positive_rate": 94.8   # Placeholder
    }
    
    # Alert Velocity (cases generated per unit)
    alert_velocity = {
        "total_alerts": total_cases,
        "alerts_per_1000_txns": (total_cases / (total_sample_txns / 1000)) if total_sample_txns > 0 else 0,
        "high_priority_percentage": (high_risk / total_cases * 100) if total_cases > 0 else 0
    }
    
    return {
        "summary": {
            "total_cases": total_cases,
            "high_risk_cases": high_risk,
            "medium_risk_cases": medium_risk,
            "low_risk_cases": low_risk,
            "total_amount": total_amount,
            "avg_amount_per_case": avg_amount,
            "max_case_amount": max_amount,
            "total_transactions": total_transactions,
            "avg_transactions_per_case": avg_txns_per_case,
            "detection_rate": detection_rate,
            "avg_patterns_per_case": avg_patterns,
            "total_sample_size": total_sample_txns
        },
        "risk_distribution": {
            "by_count": [
                {"name": "High Risk", "value": high_risk, "color": "#ef4444"},
                {"name": "Medium Risk", "value": medium_risk, "color": "#f59e0b"},
                {"name": "Low Risk", "value": low_risk, "color": "#10b981"}
            ],
            "by_amount": amount_ranges
        },
        "risk_breakdown": risk_breakdown,
        "pattern_distribution": [
            {"name": k, "count": v}
            for k, v in sorted(all_patterns.items(), key=lambda x: x[1], reverse=True)
        ],
        "top_accounts": top_accounts_data,
        "trends": {
            "high_risk_percentage": (high_risk / total_cases * 100) if total_cases > 0 else 0,
            "medium_risk_percentage": (medium_risk / total_cases * 100) if total_cases > 0 else 0,
            "low_risk_percentage": (low_risk / total_cases * 100) if total_cases > 0 else 0
        },
        "temporal_analysis": temporal_analysis,
        "bank_analysis": bank_analysis,
        "currency_analysis": currency_analysis,
        "account_type_analysis": account_type_analysis,
        "amount_statistics": amount_stats if 'amount_stats' in locals() else {},
        "investigation_metrics": investigation_metrics,
        "alert_velocity": alert_velocity
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 SARGEN Simple Server")
    print("=" * 60)
    print("📊 Server: http://localhost:8001")
    print("📖 API Docs: http://localhost:8001/docs")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8001)

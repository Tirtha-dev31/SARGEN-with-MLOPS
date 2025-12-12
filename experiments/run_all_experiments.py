"""
Run all MLflow experiments sequentially
This script executes all model experiments and logs them to MLflow
"""
import subprocess
import sys
import time

experiments = [
    ("Gradient Boosting", "experiments/gradient_boosting_experiment.py"),
    ("Logistic Regression", "experiments/logistic_regression_experiment.py"),
    ("Neural Network", "experiments/neural_network_experiment.py"),
    ("XGBoost", "experiments/xgboost_experiment.py")
]

print("=" * 70)
print("Running All SARGEN MLflow Experiments")
print("=" * 70)

results = []

for name, script in experiments:
    print(f"\n{'=' * 70}")
    print(f"Starting: {name}")
    print(f"Script: {script}")
    print(f"{'=' * 70}\n")
    
    start_time = time.time()
    
    try:
        result = subprocess.run([sys.executable, script], 
                              capture_output=False, 
                              text=True, 
                              check=True)
        elapsed = time.time() - start_time
        results.append((name, "[SUCCESS]", elapsed))
        print(f"\n[SUCCESS] {name} completed in {elapsed:.2f}s")
    except subprocess.CalledProcessError as e:
        elapsed = time.time() - start_time
        results.append((name, "[FAILED]", elapsed))
        print(f"\n[FAILED] {name} failed after {elapsed:.2f}s")
        print(f"Error: {e}")
    
    # Small delay between experiments
    time.sleep(2)

# Summary
print("\n" + "=" * 70)
print("EXPERIMENT SUMMARY")
print("=" * 70)
for name, status, elapsed in results:
    print(f"{status} {name:30s} - {elapsed:.2f}s")

print("\n" + "=" * 70)
print(f"Total experiments run: {len(results)}")
print(f"Successful: {sum(1 for _, status, _ in results if 'SUCCESS' in status)}")
print(f"Failed: {sum(1 for _, status, _ in results if 'FAILED' in status)}")
print("=" * 70)
print("\nView results in MLflow UI at: http://127.0.0.1:5000")
print("=" * 70)

"""
Script to promote ML model from staging to production in MLflow registry
"""
import mlflow
from mlflow.tracking import MlflowClient
import argparse
import sys

def promote_model(model_name: str, version: str = None, stage: str = "Production"):
    """
    Promote a model version to a new stage in MLflow Model Registry
    
    Args:
        model_name: Name of the registered model
        version: Specific version to promote (None = latest)
        stage: Target stage (Production, Staging, or Archived)
    """
    client = MlflowClient()
    
    try:
        # Get model versions
        versions = client.search_model_versions(f"name='{model_name}'")
        
        if not versions:
            print(f"❌ No versions found for model '{model_name}'")
            return False
        
        # Select version to promote
        if version:
            target_version = next((v for v in versions if v.version == version), None)
            if not target_version:
                print(f"❌ Version {version} not found")
                return False
        else:
            # Get latest version
            target_version = max(versions, key=lambda v: int(v.version))
        
        print(f"Promoting model '{model_name}' version {target_version.version} to {stage}")
        
        # Transition to new stage
        client.transition_model_version_stage(
            name=model_name,
            version=target_version.version,
            stage=stage,
            archive_existing_versions=True
        )
        
        # Add description/tag
        client.update_model_version(
            name=model_name,
            version=target_version.version,
            description=f"Promoted to {stage} on {mlflow.utils.time.now()}"
        )
        
        print(f"✅ Successfully promoted version {target_version.version} to {stage}")
        print(f"   Run ID: {target_version.run_id}")
        print(f"   Source: {target_version.source}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error promoting model: {str(e)}")
        return False

def list_models():
    """List all registered models and their versions"""
    client = MlflowClient()
    
    models = client.search_registered_models()
    
    if not models:
        print("No registered models found")
        return
    
    print("\n" + "="*80)
    print("REGISTERED MODELS")
    print("="*80)
    
    for model in models:
        print(f"\n📦 {model.name}")
        print(f"   Description: {model.description or 'N/A'}")
        
        versions = client.search_model_versions(f"name='{model.name}'")
        if versions:
            print(f"   Versions:")
            for v in sorted(versions, key=lambda x: int(x.version), reverse=True):
                print(f"     • v{v.version} - Stage: {v.current_stage} - Run: {v.run_id[:8]}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Promote MLflow model to production")
    parser.add_argument("--model-name", default="sargen_fraud_detector", 
                       help="Name of the model to promote")
    parser.add_argument("--version", type=str, default=None,
                       help="Specific version to promote (default: latest)")
    parser.add_argument("--stage", default="Production", 
                       choices=["Production", "Staging", "Archived"],
                       help="Target stage for the model")
    parser.add_argument("--list", action="store_true",
                       help="List all registered models")
    parser.add_argument("--tracking-uri", default="./mlruns",
                       help="MLflow tracking URI")
    
    args = parser.parse_args()
    
    # Set tracking URI
    mlflow.set_tracking_uri(args.tracking_uri)
    
    if args.list:
        list_models()
    else:
        success = promote_model(args.model_name, args.version, args.stage)
        sys.exit(0 if success else 1)

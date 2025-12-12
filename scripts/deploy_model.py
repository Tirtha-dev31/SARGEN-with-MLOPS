"""
Script to load and serve ML model from MLflow registry in the backend
This integrates the DVC-trained model into the FastAPI application
"""
import mlflow
from mlflow.tracking import MlflowClient
import joblib
import os
from pathlib import Path

class ModelLoader:
    """Loads production model from MLflow Model Registry"""
    
    def __init__(self, model_name: str = "sargen_fraud_detector", 
                 tracking_uri: str = "./mlruns",
                 stage: str = "Production"):
        self.model_name = model_name
        self.tracking_uri = tracking_uri
        self.stage = stage
        self.model = None
        self.model_version = None
        
        mlflow.set_tracking_uri(tracking_uri)
        self.client = MlflowClient()
    
    def load_production_model(self):
        """Load the production stage model from MLflow registry"""
        try:
            # Get production model version
            versions = self.client.get_latest_versions(self.model_name, stages=[self.stage])
            
            if not versions:
                print(f"⚠️  No {self.stage} model found, trying local model...")
                return self.load_local_model()
            
            model_version = versions[0]
            self.model_version = model_version.version
            
            # Load model
            model_uri = f"models:/{self.model_name}/{self.stage}"
            self.model = mlflow.sklearn.load_model(model_uri)
            
            print(f"✅ Loaded {self.stage} model version {self.model_version}")
            print(f"   Run ID: {model_version.run_id}")
            
            return self.model
            
        except Exception as e:
            print(f"⚠️  Failed to load MLflow model: {str(e)}")
            return self.load_local_model()
    
    def load_local_model(self):
        """Fallback: load model from local file"""
        model_path = Path("models/fraud_detector.pkl")
        
        if not model_path.exists():
            print("❌ No local model file found")
            return None
        
        try:
            self.model = joblib.load(model_path)
            print(f"✅ Loaded local model from {model_path}")
            return self.model
        except Exception as e:
            print(f"❌ Failed to load local model: {str(e)}")
            return None
    
    def predict(self, features):
        """Make predictions using the loaded model"""
        if self.model is None:
            raise RuntimeError("No model loaded")
        
        return self.model.predict(features)
    
    def predict_proba(self, features):
        """Get prediction probabilities"""
        if self.model is None:
            raise RuntimeError("No model loaded")
        
        if hasattr(self.model, 'predict_proba'):
            return self.model.predict_proba(features)
        else:
            return self.predict(features)

# Global model loader instance
_model_loader = None

def get_model_loader(reload: bool = False):
    """Get or create global model loader instance"""
    global _model_loader
    
    if _model_loader is None or reload:
        _model_loader = ModelLoader()
        _model_loader.load_production_model()
    
    return _model_loader

# Usage in app.py:
# from scripts.deploy_model import get_model_loader
# 
# @app.on_event("startup")
# async def load_model():
#     loader = get_model_loader()
#     if loader.model is None:
#         logger.warning("Failed to load production model")
# 
# @app.get("/api/model/info")
# def get_model_info():
#     loader = get_model_loader()
#     return {
#         "model_name": loader.model_name,
#         "version": loader.model_version,
#         "stage": loader.stage,
#         "loaded": loader.model is not None
#     }

"""
Model Exporter — Joblib to ONNX
===============================
Converts trained scikit-learn models into high-performance ONNX binaries
for CUDA-accelerated inference.
"""
import joblib
import onnx
from skl2onnx import to_onnx
from pathlib import Path
import os

BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / "models"

def export_model(joblib_filename: str, onnx_filename: str, n_features: int):
    path = MODEL_DIR / joblib_filename
    if not path.exists():
        print(f"[!] {joblib_filename} not found. Skip.")
        return

    print(f"[...] Exporting {joblib_filename} to ONNX...")
    model = joblib.load(path)
    
    # LinearSVC doesn't have a standardized input shape in some old versions
    # but to_onnx handles it well if we provide a sample.
    import numpy as np
    X_dummy = np.zeros((1, n_features), dtype=np.float32)
    
    onx = to_onnx(model, X_dummy)
    
    with open(MODEL_DIR / onnx_filename, "wb") as f:
        f.write(onx.SerializeToString())
    print(f"[v] Saved {onnx_filename}")

def main():
    # Load TF-IDF to get number of features
    tfidf_path = MODEL_DIR / "tfidf_vectorizer.joblib"
    if not tfidf_path.exists():
        print("[!] TF-IDF not found. Run training first.")
        return
    
    tfidf = joblib.load(tfidf_path)
    n_features = len(tfidf.get_feature_names_out())
    print(f"[i] TF-IDF features: {n_features}")

    # Export Router
    export_model("router_svm.joblib", "router.onnx", n_features)
    
    # Export Specialists
    export_model("social_svm.joblib", "social.onnx", n_features)
    export_model("business_svm.joblib", "business.onnx", n_features)

if __name__ == "__main__":
    main()

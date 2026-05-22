import os
import joblib
import pandas as pd
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from pathlib import Path
import sys

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_PATH = BASE_DIR / "data" / "router_data.csv"
MODEL_DIR = BASE_DIR / "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train():
    if not DATA_PATH.exists():
        print(f"[!] Data not found at {DATA_PATH}. Run data_prep.py first.")
        return

    print("[...] Training Stage 1: Router SVM (Social vs Business)...")
    df = pd.read_csv(DATA_PATH).dropna()

    # TF-IDF Pipeline
    tfidf = TfidfVectorizer(max_features=15000, ngram_range=(1, 2))
    
    # Use GPU if requested and available
    use_gpu = os.environ.get("USE_GPU", "false").lower() == "true"
    
    if use_gpu:
        try:
            import cudf
            from cuml.svm import LinearSVC as cuSVC
            print("[v] Using NVIDIA cuML for GPU acceleration")
            X = tfidf.fit_transform(df['text']).toarray()
            y = df['domain']
            model = cuSVC()
            model.fit(X, y)
        except ImportError:
            print("[!] cuML not found. Falling back to CPU.")
            model = LinearSVC()
            X = tfidf.fit_transform(df['text'])
            model.fit(X, df['domain'])
    else:
        print("[v] Using scikit-learn (CPU)")
        X = tfidf.fit_transform(df['text'])
        model = LinearSVC()
        model.fit(X, df['domain'])

    # Save
    joblib.dump(model, MODEL_DIR / "router_svm.joblib")
    joblib.dump(tfidf, MODEL_DIR / "tfidf_vectorizer.joblib")
    print(f"[v] Router model saved to {MODEL_DIR}")

if __name__ == "__main__":
    train()

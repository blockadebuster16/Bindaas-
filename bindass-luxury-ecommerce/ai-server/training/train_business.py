"""
Train Business Specialist SVM
==============================
Multi-class SVM for business intents
"""
import os, sys, time, joblib
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

sys.path.insert(0, str(Path(__file__).parent.parent))

# Correct Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
USE_GPU = os.getenv("USE_GPU", "false").lower() == "true"

def main():
    csv_path = DATA_DIR / "business_intents.csv"
    if not csv_path.exists():
        print(f"[!] {csv_path.name} not found. Run: python training/data_prep.py")
        sys.exit(1)

    tfidf_path = MODELS_DIR / "tfidf_vectorizer.joblib"
    if not tfidf_path.exists():
        print("[!] TF-IDF vectorizer not found. Run: python training/train_router.py first")
        sys.exit(1)

    print("[...] Loading business dataset...")
    df = pd.read_csv(csv_path).dropna()
    print(f"    {len(df)} samples")

    from services.preprocessor import clean_text
    print("[...] Preprocessing text...")
    cleaned = [clean_text(t) for t in df["text"].tolist()]

    vectorizer = joblib.load(tfidf_path)
    X = vectorizer.transform(cleaned)
    y = df["intent"].tolist()

    # Determine test size based on sample count
    test_size = 0.2 if len(df) > 100 else 0.1
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

    t0 = time.time()
    if USE_GPU:
        try:
            import cupy as cp
            from cuml.svm import SVC as cuSVC
            print("[v] GPU training...")
            svm = cuSVC(kernel="rbf", C=10.0, probability=True)
            svm.fit(cp.array(X_train.toarray(), dtype=cp.float32), cp.array(y_train))
        except ImportError:
            print("[!] cuML/cupy not found. Falling back to CPU.")
            from sklearn.svm import LinearSVC
            from sklearn.calibration import CalibratedClassifierCV
            svm = CalibratedClassifierCV(LinearSVC(C=5.0, max_iter=3000), cv=3)
            svm.fit(X_train, y_train)
    else:
        from sklearn.svm import LinearSVC
        from sklearn.calibration import CalibratedClassifierCV
        print("[v] CPU training...")
        svm = CalibratedClassifierCV(LinearSVC(C=5.0, max_iter=3000), cv=3)
        svm.fit(X_train, y_train)

    print(f"[v] Training took {time.time() - t0:.2f}s")

    y_pred = svm.predict(X_test)
    print("\n--- Business SVM Classification Report ---")
    print(classification_report(y_test, y_pred))

    joblib.dump(svm, MODELS_DIR / "business_svm.joblib")
    print(f"[v] Business SVM saved to {MODELS_DIR}")

if __name__ == "__main__":
    main()

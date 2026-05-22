from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "nexa_db"

    # Supabase (PostgreSQL — Refund Audit Trail)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # JWT
    SECRET_KEY: str = "change-me-in-production-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Model paths
    ROUTER_MODEL_PATH: str = str(BASE_DIR / "models" / "router_svm.joblib")
    SOCIAL_MODEL_PATH: str = str(BASE_DIR / "models" / "social_svm.joblib")
    BUSINESS_MODEL_PATH: str = str(BASE_DIR / "models" / "business_svm.joblib")
    TFIDF_MODEL_PATH: str = str(BASE_DIR / "models" / "tfidf_vectorizer.joblib")

    # Frontend URL (for CORS)
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()

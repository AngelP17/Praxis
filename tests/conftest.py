import os

# Force local development settings and SQLite database for all testing runs
os.environ["DATABASE_URL"] = "sqlite:///./test_praxis.db"
os.environ["ENV"] = "development"
os.environ["DEBUG"] = "True"
os.environ["SECRET_KEY"] = "change-me-in-production-safety-for-testing-only"
os.environ["AUTO_INIT_DB"] = "True"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000,http://127.0.0.1:3000"

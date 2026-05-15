from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

env_file = Path(__file__).parent.parent.parent / ".env"
LOCAL_ORIGIN_PREFIXES = ("http://localhost", "http://127.0.0.1", "https://localhost", "https://127.0.0.1")
INSECURE_SECRET_PREFIXES = ("change-me-in-production", "replace-me", "example-secret")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(env_file) if env_file.exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./praxis.db"
    SECRET_KEY: str = "change-me-in-production"
    ENV: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    AUTO_INIT_DB: bool = True
    USERS_FILE: str | None = None

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 600

    # Lambda compute
    USE_LAMBDA_COMPUTE: bool = False  # Set to True for production Lambda compute

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # "json" or "console"

    # Floci configuration
    FLOCI_ENDPOINT: str = "http://localhost:4566"
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = "test"
    AWS_SECRET_ACCESS_KEY: str = "test"

    # Service URLs
    DECISION_SERVICE_URL: str = "http://localhost:8001"
    PLATFORM_SERVICE_URL: str = "http://localhost:8080"

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @model_validator(mode="after")
    def validate_production_safety(self) -> "Settings":
        if not self.is_production:
            return self

        if self.DEBUG:
            raise ValueError("DEBUG must be false when ENV=production")

        normalized_secret = self.SECRET_KEY.strip()
        if not normalized_secret or normalized_secret.startswith(INSECURE_SECRET_PREFIXES):
            raise ValueError("SECRET_KEY must be overridden with a strong value when ENV=production")

        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        if not origins or "*" in origins:
            raise ValueError("ALLOWED_ORIGINS must list explicit public frontend origins when ENV=production")

        has_public_origin = any(not origin.startswith(LOCAL_ORIGIN_PREFIXES) for origin in origins)
        if not has_public_origin:
            raise ValueError("ALLOWED_ORIGINS must include at least one non-localhost origin when ENV=production")

        return self


settings = Settings()

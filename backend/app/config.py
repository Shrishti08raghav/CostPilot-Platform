import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CostPilot - Cloud Cost Optimization Platform"
    
    # DATABASE_URL configuration. Defaults to a local SQLite database for zero-dependency run.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./costpilot.db")
    
    # Security settings for JWT (JSON Web Tokens) authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_for_development_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # Token expires in 24 hours
    
    # AWS Simulation Settings
    # If AWS_ACCESS_KEY_ID is not set, we default to SIMULATION_MODE = True
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    
    @property
    def SIMULATION_MODE(self) -> bool:
        return not bool(self.AWS_ACCESS_KEY_ID and self.AWS_SECRET_ACCESS_KEY)

settings = Settings()

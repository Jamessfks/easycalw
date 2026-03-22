"""
Configuration module for survivor-network-3d backend.
Loads environment variables from .env file using python-dotenv.
"""
import os
from dotenv import load_dotenv

# Load .env from project root (searches parent directories automatically)
load_dotenv()

# Export configuration classes
from .extraction_config import ExtractionConfig, MediaType

class Settings:
    PROJECT_ID = os.getenv("PROJECT_ID")
    INSTANCE_ID = os.getenv("INSTANCE_ID", "survivor-network")
    DATABASE_ID = os.getenv("DATABASE_ID", "graph-db")
    GRAPH_NAME = os.getenv("GRAPH_NAME", "SurvivorGraph")
    REGION = os.getenv("REGION", "us-central1")
    LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    USE_MEMORY_BANK = os.getenv("USE_MEMORY_BANK", "false").lower() == "true"

settings = Settings()

__all__ = ['ExtractionConfig', 'MediaType', 'settings']


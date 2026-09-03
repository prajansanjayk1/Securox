import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, ConfigDict

class Settings(BaseModel):
    model_config = ConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "CAREGUARD — Cyber-to-Care Healthcare Security Intelligence"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Absolute path to organic datasets folder
    DATASETS_DIR: str = os.getenv(
        "DATASETS_DIR",
        str(Path(__file__).resolve().parent.parent.parent.parent / "datasets")
    )
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Zero Synthetic Data Policy Flag
    ZERO_SYNTHETIC_DATA: bool = True

settings = Settings()


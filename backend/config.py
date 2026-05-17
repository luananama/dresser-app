from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    DATABASE_URL: str
    MAX_IMAGE_SIZE_MB: int = 5

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_BUCKET: str = "clothing-images"

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: object) -> object:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v


settings = Settings()

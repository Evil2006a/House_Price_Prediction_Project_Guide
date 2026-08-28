from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment variables / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    model_path: str = "app/models/house_price.pkl"
    locations_path: str = "app/models/locations.json"
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()

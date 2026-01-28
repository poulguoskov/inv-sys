from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/invsys"
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

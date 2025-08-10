import os
import secrets
import warnings
from typing import Annotated, Any, Literal

from dotenv import load_dotenv
from pydantic import (
    AnyUrl,
    BeforeValidator,
    PostgresDsn,
    computed_field,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self

# Load .env từ thư mục cha cấp 2
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=dotenv_path)

def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_ignore_empty=True,
        extra="ignore",
        env_file=dotenv_path
    )

    UNICORE_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # General
    PROJECT_NAME: str = "UNICORE"
    ENVIRONMENT: Literal["local", "staging", "production", "uat", "development"] = "local"

    # CORS
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = []
    FRONTEND_HOST: str = "http://localhost:5173"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [self.FRONTEND_HOST]

    # PostgreSQL
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5434
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=f"{self.POSTGRES_DB}",
        )

settings = Settings()  # type: ignore

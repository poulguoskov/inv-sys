from datetime import datetime

from pydantic import BaseModel


class ConfigurationBase(BaseModel):
    """Shared fields for configurations."""

    name: str
    description: str | None = None


class ConfigurationCreate(ConfigurationBase):
    """Fields for creating a configuration."""

    pass


class ConfigurationUpdate(BaseModel):
    """Fields for updating a configuration."""

    name: str | None = None
    description: str | None = None


class ConfigurationResponse(ConfigurationBase):
    """Fields returned when reading a configuration."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True

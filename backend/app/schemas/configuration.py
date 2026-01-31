from datetime import datetime
from pydantic import BaseModel


class ConfigurationComponentInput(BaseModel):
    """Component input for configuration."""

    item_id: int
    quantity: int = 1


class ConfigurationComponentResponse(BaseModel):
    """Component with item details."""

    id: int
    item_id: int
    quantity: int
    item_name: str | None = None
    item_sku: str | None = None

    class Config:
        from_attributes = True


class ConfigurationBase(BaseModel):
    """Shared fields for configurations."""

    name: str
    description: str | None = None


class ConfigurationCreate(ConfigurationBase):
    """Fields for creating a configuration."""

    components: list[ConfigurationComponentInput] = []


class ConfigurationUpdate(BaseModel):
    """Fields for updating a configuration."""

    name: str | None = None
    description: str | None = None


class ConfigurationResponse(ConfigurationBase):
    """Fields returned when reading a configuration."""

    id: int
    archived: bool
    created_at: datetime
    components: list[ConfigurationComponentResponse] = []

    class Config:
        from_attributes = True

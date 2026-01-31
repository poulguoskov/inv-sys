from datetime import datetime

from pydantic import BaseModel


class AssemblyComponentBase(BaseModel):
    """A component in an assembly."""

    item_id: int
    quantity: int = 1


class AssemblyComponentResponse(AssemblyComponentBase):
    """Component with item details."""

    id: int
    item_name: str | None = None
    item_sku: str | None = None

    class Config:
        from_attributes = True


class AssemblyBase(BaseModel):
    """Shared fields for assemblies."""

    configuration_id: int | None = None
    order_reference: str | None = None
    notes: str | None = None


class AssemblyCreate(AssemblyBase):
    """Fields for creating an assembly."""

    components: list[AssemblyComponentBase] = []


class AssemblyUpdate(BaseModel):
    """Fields for updating an assembly."""

    order_reference: str | None = None
    notes: str | None = None


class AssemblyResponse(AssemblyBase):
    """Fields returned when reading an assembly."""

    id: int
    status: str
    created_at: datetime
    completed_at: datetime | None = None
    shipped_at: datetime | None = None
    components: list[AssemblyComponentResponse] = []

    class Config:
        from_attributes = True

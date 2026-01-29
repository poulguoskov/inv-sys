from datetime import datetime

from pydantic import BaseModel


class ItemBase(BaseModel):
    """Shared fields for items."""

    name: str
    sku: str
    barcode: str | None = None
    type: str
    reorder_threshold: int | None = None
    lead_time_days: int | None = None


class ItemCreate(ItemBase):
    """Fields for creating an item."""

    quantity_on_hand: int = 0
    quantity_on_order: int = 0


class ItemUpdate(BaseModel):
    """Fields for updating an itme. All optional."""

    name: str | None = None
    sku: str | None = None
    barcode: str | None = None
    type: str | None = None
    quantity_on_hand: int | None = None
    quantity_on_order: int | None = None
    reorder_threshold: int | None = None
    lead_time_days: int | None = None


class ItemResponse(ItemBase):
    """Fields returned when reading an item."""

    id: int
    quantity_on_hand: int
    quantity_reserved: int
    quantity_on_order: int
    quantity_available: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

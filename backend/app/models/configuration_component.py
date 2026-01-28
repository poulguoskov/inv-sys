from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ConfigurationComponent(Base):
    __tablename__ = "configuration_components"

    id: Mapped[int] = mapped_column(primary_key=True)
    configuration_id: Mapped[int] = mapped_column(
        "configuration_id", ForeignKey("configurations.id")
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

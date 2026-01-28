from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AssemblyComponent(Base):
    __tablename__ = "assembly_components"

    id: Mapped[int] = mapped_column(primary_key=True)
    assembly_id: Mapped[int] = mapped_column(ForeignKey("assemblies.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

"""add order_reference and shipped_at to assemblies

Revision ID: 3ecb10c398a4
Revises: b8cb12ce4027
Create Date: 2026-01-30 23:53:32.764592

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3ecb10c398a4"
down_revision: Union[str, Sequence[str], None] = "b8cb12ce4027"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "assemblies", sa.Column("order_reference", sa.String(100), nullable=True)
    )
    op.add_column("assemblies", sa.Column("shipped_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("assemblies", "shipped_at")
    op.drop_column("assemblies", "order_reference")

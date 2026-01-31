"""add archived field to configurations

Revision ID: 37870626322d
Revises: 3ecb10c398a4
Create Date: 2026-01-31 12:46:08.502358

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "37870626322d"
down_revision: Union[str, Sequence[str], None] = "3ecb10c398a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "configurations",
        sa.Column("archived", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("configurations", "archived")

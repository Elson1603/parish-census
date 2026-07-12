"""drop house_number column from families

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-13
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.drop_column("families", "house_number")


def downgrade() -> None:
    op.add_column(
        "families",
        sa.Column("house_number", sa.String(length=50), nullable=False, server_default=""),
    )

"""drop master_data_items table

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-13
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.drop_index("ix_master_data_category", table_name="master_data_items")
    op.drop_table("master_data_items")


def downgrade() -> None:
    op.create_table(
        "master_data_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("category", "name", name="uq_master_data_category_name"),
    )
    op.create_index("ix_master_data_category", "master_data_items", ["category"])

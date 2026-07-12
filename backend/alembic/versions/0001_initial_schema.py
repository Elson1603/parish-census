"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-12
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "villages",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "families",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "village_id",
            sa.String(length=36),
            sa.ForeignKey("villages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("house_number", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("head_of_family", sa.String(length=200), nullable=False),
        sa.Column("contact_number", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("alternate_number", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=200), nullable=True),
        sa.Column("address", sa.Text(), nullable=False, server_default=""),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_families_village_id", "families", ["village_id"])

    op.create_table(
        "members",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "family_id",
            sa.String(length=36),
            sa.ForeignKey("families.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("gender", sa.String(length=10), nullable=False, server_default=""),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        sa.Column("blood_group", sa.String(length=10), nullable=False, server_default=""),
        sa.Column("mobile", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("email", sa.String(length=200), nullable=True),
        sa.Column("occupation", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("education", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("baptized", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("first_communion", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("confirmation", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("church_marriage", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("church_group", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("relationship_with_head", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("marital_status", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("special_needs", sa.String(length=100), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_members_family_id", "members", ["family_id"])

    op.create_table(
        "master_data_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("category", "name", name="uq_master_data_category_name"),
    )
    op.create_index("ix_master_data_category", "master_data_items", ["category"])


def downgrade() -> None:
    op.drop_index("ix_master_data_category", table_name="master_data_items")
    op.drop_table("master_data_items")
    op.drop_index("ix_members_family_id", table_name="members")
    op.drop_table("members")
    op.drop_index("ix_families_village_id", table_name="families")
    op.drop_table("families")
    op.drop_table("villages")

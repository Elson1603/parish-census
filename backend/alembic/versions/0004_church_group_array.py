"""convert members.church_group from a single string to a string array

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-13
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    # The existing '' default can't be auto-cast to an array type, so it must be
    # dropped before ALTER COLUMN TYPE and re-added afterwards.
    op.execute("ALTER TABLE members ALTER COLUMN church_group DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE members
        ALTER COLUMN church_group TYPE varchar(100)[]
        USING (CASE WHEN church_group = '' THEN ARRAY[]::varchar(100)[] ELSE ARRAY[church_group] END)
        """
    )
    op.execute("ALTER TABLE members ALTER COLUMN church_group SET DEFAULT '{}'")


def downgrade() -> None:
    op.execute("ALTER TABLE members ALTER COLUMN church_group DROP DEFAULT")
    op.execute(
        """
        ALTER TABLE members
        ALTER COLUMN church_group TYPE varchar(100)
        USING (CASE WHEN array_length(church_group, 1) IS NULL THEN '' ELSE church_group[1] END)
        """
    )
    op.execute("ALTER TABLE members ALTER COLUMN church_group SET DEFAULT ''")

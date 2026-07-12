from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.census import Member


async def assert_mobile_available(
    db: AsyncSession, mobile: str | None, exclude_member_id: str | None = None
) -> None:
    """Blank numbers are exempt - the quick census intake often leaves phone unset,
    and multiple members having "no phone" isn't a real conflict. Any number that
    IS entered must not already belong to another member."""
    if not mobile:
        return

    stmt = select(Member.id).where(Member.mobile == mobile)
    if exclude_member_id:
        stmt = stmt.where(Member.id != exclude_member_id)

    existing = await db.scalar(stmt)
    if existing:
        raise HTTPException(
            status_code=409, detail="This mobile number is already used by another member"
        )

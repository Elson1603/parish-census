from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.census import Village


async def get_or_create_village(db: AsyncSession, name: str) -> Village:
    clean_name = name.strip()
    village = await db.scalar(select(Village).where(func.lower(Village.name) == clean_name.lower()))
    if village:
        return village

    village = Village(name=clean_name)
    db.add(village)
    await db.flush()
    return village

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member, Village
from app.schemas import census as schemas

router = APIRouter(prefix="/villages", tags=["villages"])


async def _village_rows(db: AsyncSession, village_id: str | None = None):
    families_count = (
        select(Family.village_id, func.count(Family.id).label("total_families"))
        .group_by(Family.village_id)
        .subquery()
    )
    members_count = (
        select(Family.village_id, func.count(Member.id).label("total_members"))
        .join(Member, Member.family_id == Family.id)
        .group_by(Family.village_id)
        .subquery()
    )
    stmt = (
        select(
            Village,
            func.coalesce(families_count.c.total_families, 0).label("total_families"),
            func.coalesce(members_count.c.total_members, 0).label("total_members"),
        )
        .outerjoin(families_count, families_count.c.village_id == Village.id)
        .outerjoin(members_count, members_count.c.village_id == Village.id)
        .order_by(Village.name)
    )
    if village_id is not None:
        stmt = stmt.where(Village.id == village_id)

    result = await db.execute(stmt)
    return result.all()


@router.get("", response_model=list[schemas.Village])
async def list_villages(db: AsyncSession = Depends(get_db)):
    rows = await _village_rows(db)
    return [
        schemas.Village(id=v.id, name=v.name, total_families=tf, total_members=tm)
        for v, tf, tm in rows
    ]


@router.get("/{village_id}", response_model=schemas.Village)
async def get_village(village_id: str, db: AsyncSession = Depends(get_db)):
    rows = await _village_rows(db, village_id=village_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Village not found")
    v, tf, tm = rows[0]
    return schemas.Village(id=v.id, name=v.name, total_families=tf, total_members=tm)


@router.post("", response_model=schemas.Village, status_code=201)
async def create_village(payload: schemas.VillageCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(Village).where(func.lower(Village.name) == payload.name.strip().lower()))
    if existing:
        raise HTTPException(status_code=409, detail="Village already exists")

    village = Village(name=payload.name.strip())
    db.add(village)
    await db.commit()
    await db.refresh(village)
    return schemas.Village(id=village.id, name=village.name, total_families=0, total_members=0)

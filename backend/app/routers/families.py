from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Village
from app.schemas import census as schemas
from app.services.queries import family_select, member_select

router = APIRouter(prefix="/families", tags=["families"])


@router.get("", response_model=list[schemas.Family])
async def list_families(
    search: str | None = Query(default=None),
    village: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = family_select()

    if search:
        pattern = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Family.head_of_family).like(pattern),
                func.lower(Village.name).like(pattern),
            )
        )
    if village and village != "all":
        stmt = stmt.where(Family.village_id == village)

    stmt = stmt.order_by(Family.created_at.desc())
    rows = (await db.execute(stmt)).all()
    return [schemas.Family.model_validate(dict(row._mapping)) for row in rows]


@router.get("/{family_id}", response_model=schemas.FamilyWithMembers)
async def get_family(family_id: str, db: AsyncSession = Depends(get_db)):
    family_row = (await db.execute(family_select().where(Family.id == family_id))).first()
    if not family_row:
        raise HTTPException(status_code=404, detail="Family not found")

    member_rows = (await db.execute(member_select().where(Family.id == family_id))).all()

    return schemas.FamilyWithMembers(
        family=schemas.Family.model_validate(dict(family_row._mapping)),
        family_members=[schemas.Member.model_validate(dict(row._mapping)) for row in member_rows],
    )


@router.post("", response_model=schemas.Family, status_code=201)
async def create_family(payload: schemas.FamilyCreate, db: AsyncSession = Depends(get_db)):
    village = await db.get(Village, payload.village_id)
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    family = Family(
        village_id=payload.village_id,
        head_of_family=payload.head_of_family,
        contact_number=payload.contact_number,
        alternate_number=payload.alternate_number,
        email=payload.email,
        address=payload.address,
        remarks=payload.remarks,
    )
    db.add(family)
    await db.commit()

    row = (await db.execute(family_select().where(Family.id == family.id))).first()
    return schemas.Family.model_validate(dict(row._mapping))

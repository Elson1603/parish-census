from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member, Village
from app.schemas import census as schemas

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{report_type}", response_model=list[schemas.ReportResultRow])
async def get_report(
    report_type: str,
    village: str | None = Query(default=None),
    occupation: str | None = Query(default=None),
    education: str | None = Query(default=None),
    fromDate: date | None = Query(default=None),
    toDate: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Village.id,
            Village.name,
            func.count(func.distinct(Family.id)).label("families"),
            func.count(Member.id).label("members"),
            func.count(case((Member.gender == "Male", 1))).label("male"),
            func.count(case((Member.gender == "Female", 1))).label("female"),
        )
        .select_from(Village)
        .outerjoin(Family, Family.village_id == Village.id)
        .outerjoin(Member, Member.family_id == Family.id)
    )

    if village and village != "all":
        stmt = stmt.where(Village.id == village)
    if occupation and occupation != "all":
        stmt = stmt.where(Member.occupation == occupation)
    if education and education != "all":
        stmt = stmt.where(Member.education == education)
    if fromDate:
        stmt = stmt.where(func.date(Member.created_at) >= fromDate)
    if toDate:
        stmt = stmt.where(func.date(Member.created_at) <= toDate)

    stmt = stmt.group_by(Village.id, Village.name).order_by(Village.name)

    rows = (await db.execute(stmt)).all()
    return [
        schemas.ReportResultRow(
            id=f"r-{village_id}",
            label=f"Report Row {index + 1}",
            village=name,
            families=families,
            members=members,
            male=male,
            female=female,
        )
        for index, (village_id, name, families, members, male, female) in enumerate(rows)
    ]
